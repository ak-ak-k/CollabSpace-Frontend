import { TestBed } from '@angular/core/testing';
import { DeliveryState, Message } from '../models/message';
import { ChatState } from './chat.state';
import { InviteState } from './invite.state';
import { countQueuedMessages, pendingWorkOf } from './pending-work';
import { PendingWorkState } from './pending-work.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';

const message = (id: string, deliveryState: DeliveryState): Message => ({
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

describe('pending work', () => {
  it('counts queued messages and messages whose sync failed in every conversation', () => {
    const threads = {
      'dm-u1': [message('1', 'queued'), message('2', 'sent'), message('3', 'failed')],
      'g-launch': [message('4', 'queued'), message('5', 'sending')],
      'g-design': [{ ...message('6', 'failed'), syncFailed: true }],
    };

    expect(countQueuedMessages(threads)).toBe(3);
    expect(countQueuedMessages({})).toBe(0);
  });

  it('adds every queue into a total', () => {
    expect(pendingWorkOf({ messages: 2, tasks: 1, invites: 3 })).toEqual({
      messages: 2,
      tasks: 1,
      invites: 3,
      total: 6,
    });
  });

  it('tracks queued messages and invitations from the app state', async () => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
    const pending = TestBed.inject(PendingWorkState);
    await settle();
    expect(pending.hasPendingWork()).toBe(false);

    TestBed.inject(ChatState).messages.set({ 'dm-u1': [message('1', 'queued')] });
    await TestBed.inject(InviteState).invite({
      emails: ['offline.person@northstar.io'],
      role: 'member',
      teamId: null,
      queued: true,
    });

    expect(pending.pendingWork()).toEqual({ messages: 1, tasks: 0, invites: 1, total: 2 });
  });
});
