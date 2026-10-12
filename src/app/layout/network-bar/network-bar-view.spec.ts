import { pendingWorkOf } from '../../core/state/pending-work';
import { networkBarOf } from './network-bar-view';

const NOTE =
  'Messages, task updates and invitations sync when you reconnect; other changes need a connection.';

describe('network bar view', () => {
  const none = pendingWorkOf({ messages: 0, tasks: 0, invites: 0 });

  it('explains the offline state and counts changes saved on this device', () => {
    const empty = networkBarOf('offline', none, 0);
    const busy = networkBarOf('offline', pendingWorkOf({ messages: 2, tasks: 1, invites: 0 }), 0);

    expect(empty).toMatchObject({ role: 'status', tone: 'ink', title: 'You’re offline.' });
    expect(empty?.text).toBe(`Showing what’s already loaded. ${NOTE}`);
    expect(busy?.text).toBe(`3 changes saved on this device. ${NOTE}`);
    expect(busy?.showDetails).toBe(true);
    expect(busy?.action).toEqual({ label: 'Retry', command: 'retry-connection' });
  });

  it('shows a busy reconnecting bar without actions', () => {
    expect(networkBarOf('reconnecting', none, 1)).toMatchObject({
      busy: true,
      title: 'Reconnecting…',
      text: 'Syncing 1 change made while you were offline.',
      action: null,
    });
    expect(networkBarOf('reconnecting', none, 0)?.text).toBe('Checking the connection.');
  });

  it('raises an alert when changes did not sync', () => {
    const one = networkBarOf(
      'sync-failed',
      pendingWorkOf({ messages: 0, tasks: 1, invites: 0 }),
      0,
    );
    const many = networkBarOf(
      'sync-failed',
      pendingWorkOf({ messages: 2, tasks: 0, invites: 1 }),
      0,
    );

    expect(one).toMatchObject({ role: 'alert', tone: 'danger' });
    expect(one?.text).toBe('1 change is still only on this device.');
    expect(many?.text).toBe(
      '3 changes are still only on this device — failed messages also show Retry in their conversation.',
    );
    expect(many?.action?.command).toBe('retry-sync');
    expect(networkBarOf('online', none, 0)).toBeNull();
  });
});
