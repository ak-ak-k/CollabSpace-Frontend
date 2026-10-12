import { TestBed } from '@angular/core/testing';
import { ToastService } from '../services/toast.service';
import { DeliveryState, Message } from '../models/message';
import { ChatState } from './chat.state';
import { CONNECTION_SYNC_DELAYS } from './connection-sync';
import { ConnectionSyncState } from './connection-sync.state';
import { InviteState } from './invite.state';
import { NetworkState } from './network.state';
import { PendingWorkState } from './pending-work.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TaskState } from './task.state';
import { WorkspaceActivityState } from './workspace-activity.state';

const queued = (id: string, deliveryState: DeliveryState = 'queued'): Message => ({
  id,
  conversationId: 'dm-u1',
  authorId: 'u0',
  text: `Message ${id}`,
  sentAt: 1,
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId: null,
  pinned: false,
  deliveryState,
});

describe('ConnectionSyncState', () => {
  const setup = async () => {
    TestBed.configureTestingModule({
      providers: [
        INSTANT_MOCK_DATA,
        { provide: CONNECTION_SYNC_DELAYS, useValue: { withChanges: 0, idle: 0 } },
      ],
    });
    const connection = TestBed.inject(ConnectionSyncState);
    await settle();
    const network = TestBed.inject(NetworkState);
    network.simulateOffline(true);
    TestBed.tick();
    TestBed.inject(ChatState).messages.set({ 'dm-u1': [queued('1')] });
    await TestBed.inject(TaskState).update('NS-142', { priority: 'urgent' });
    await TestBed.inject(InviteState).invite({
      emails: ['offline.person@northstar.io'],
      role: 'member',
      teamId: null,
      queued: true,
    });
    TestBed.inject(WorkspaceActivityState).record({
      kind: 'invite',
      verb: 'invited',
      object: 'offline.person@northstar.io',
      route: '/workspace/members/invited',
      outcome: 'pending',
    });
    return { connection, network, pending: TestBed.inject(PendingWorkState) };
  };

  const inviteOutcome = () =>
    TestBed.inject(WorkspaceActivityState).events({ category: 'audit' })[0].outcome;

  it('syncs every queue on reconnect and reports what was sent', async () => {
    const { connection, network, pending } = await setup();
    expect(connection.phase()).toBe('offline');
    expect(pending.pendingWork().total).toBe(3);

    network.simulateOffline(false);
    TestBed.tick();
    expect(connection.phase()).toBe('reconnecting');
    expect(connection.syncingCount()).toBe(3);
    await settle();

    expect(connection.phase()).toBe('online');
    expect(pending.pendingWork().total).toBe(0);
    expect(TestBed.inject(ChatState).messages()['dm-u1'][0].deliveryState).toBe('sent');
    expect(inviteOutcome()).toBe('succeeded');
    expect(TestBed.inject(ToastService).toasts().at(-1)?.message).toBe(
      'Connection restored — 1 message sent, 1 task update synced, 1 invitation sent',
    );
  });

  it('keeps failed changes on the device until a retry succeeds', async () => {
    const { connection, network, pending } = await setup();
    network.simulateSyncFailure(true);

    network.simulateOffline(false);
    TestBed.tick();
    await settle();

    expect(connection.phase()).toBe('sync-failed');
    expect(TestBed.inject(ChatState).messages()['dm-u1'][0]).toMatchObject({
      deliveryState: 'failed',
      syncFailed: true,
    });
    expect(inviteOutcome()).toBe('failed');
    expect(pending.pendingWork().total).toBe(3);

    network.simulateSyncFailure(false);
    connection.retrySync();
    await settle();

    expect(connection.phase()).toBe('online');
    expect(pending.pendingWork().total).toBe(0);
    expect(inviteOutcome()).toBe('succeeded');
  });
});
