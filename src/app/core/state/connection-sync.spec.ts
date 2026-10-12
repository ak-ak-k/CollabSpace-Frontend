import { syncDelayOf, syncSummaryOf, visiblePhaseOf } from './connection-sync';
import { pendingWorkOf } from './pending-work';

const delays = { withChanges: 1100, idle: 500 };

describe('connection sync', () => {
  it('summarises what was synced when the connection returns', () => {
    expect(syncSummaryOf(pendingWorkOf({ messages: 2, tasks: 1, invites: 1 }))).toBe(
      'Connection restored — 2 messages sent, 1 task update synced, 1 invitation sent',
    );
    expect(syncSummaryOf(pendingWorkOf({ messages: 1, tasks: 0, invites: 3 }))).toBe(
      'Connection restored — 1 message sent, 3 invitations sent',
    );
    expect(syncSummaryOf(pendingWorkOf({ messages: 0, tasks: 0, invites: 0 }))).toBe(
      'Connection restored',
    );
  });

  it('waits longer when there are changes to sync', () => {
    expect(syncDelayOf(3, delays)).toBe(1100);
    expect(syncDelayOf(0, delays)).toBe(500);
  });

  it('shows offline whenever the network is down and hides a resolved sync failure', () => {
    expect(visiblePhaseOf('online', false, 0)).toBe('offline');
    expect(visiblePhaseOf('offline', true, 2)).toBe('reconnecting');
    expect(visiblePhaseOf('sync-failed', true, 2)).toBe('sync-failed');
    expect(visiblePhaseOf('sync-failed', true, 0)).toBe('online');
  });
});
