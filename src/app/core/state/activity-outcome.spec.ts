import { ActivityEvent } from '../models/activity';
import { pendingOfKind, unsettledOfKind, withOutcome } from './activity-outcome';

const event = (id: string, kind: ActivityEvent['kind'], outcome: ActivityEvent['outcome']) =>
  ({ id, kind, outcome }) as ActivityEvent;

describe('activity outcome', () => {
  const events = [
    event('a', 'task', 'pending'),
    event('b', 'invite', 'pending'),
    event('c', 'invite', 'failed'),
    event('d', 'invite', 'succeeded'),
  ];

  it('flips only the matching unsettled events', () => {
    const failed = withOutcome(events, pendingOfKind('invite'), 'failed');

    expect(failed.events.map((item) => item.outcome)).toEqual([
      'pending',
      'failed',
      'failed',
      'succeeded',
    ]);
    expect([...failed.changedIds]).toEqual(['b']);
  });

  it('settles pending and failed events and leaves the list alone when nothing matches', () => {
    const settled = withOutcome(events, unsettledOfKind('invite'), 'succeeded');

    expect([...settled.changedIds]).toEqual(['b', 'c']);
    expect(withOutcome(events, unsettledOfKind('file'), 'succeeded').events).toBe(events);
  });
});
