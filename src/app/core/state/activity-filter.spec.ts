import { ActivityEvent } from '../models/activity';
import {
  ActivityScope,
  entityEventsOf,
  eventsInScope,
  matchesActivityFilter,
} from './activity-filter';

const event = (id: string, changes: Partial<ActivityEvent>): ActivityEvent => ({
  id,
  workspaceId: 'w1',
  actorId: 'u1',
  verb: 'created',
  object: id,
  occurredAt: 10,
  kind: 'task',
  route: `/tasks?task=${id}`,
  category: 'activity',
  entity: null,
  teamId: null,
  change: null,
  ...changes,
});

const scope: ActivityScope = {
  workspaceId: 'w1',
  visibleTeamIds: new Set(['t-open']),
  hasTask: (taskId) => taskId !== 'gone',
  hasFile: () => true,
};

describe('activity filter', () => {
  it('keeps the current workspace, newest first, hiding teams I cannot see except in the audit log', () => {
    const events = [
      event('old', { occurredAt: 1 }),
      event('new', { occurredAt: 30, teamId: 't-open' }),
      event('other-workspace', { workspaceId: 'w2' }),
      event('hidden-team', { teamId: 't-archived' }),
      event('audit', { category: 'audit', kind: 'invite', teamId: 't-archived' }),
    ];

    expect(eventsInScope(events, scope).map(({ id }) => id)).toEqual(['new', 'audit', 'old']);
  });

  it('keeps the text of an event whose task is gone but drops its link', () => {
    const [gone] = eventsInScope([event('gone', { entity: { type: 'task', id: 'gone' } })], scope);

    expect(gone).toMatchObject({ object: 'gone', route: '' });
  });

  it('filters by category, team, actor, group and date', () => {
    const task = event('task', { teamId: 't-open', occurredAt: 50 });
    const invite = event('invite', { kind: 'invite', category: 'audit' });

    expect(matchesActivityFilter(task, {})).toBe(true);
    expect(matchesActivityFilter(invite, {})).toBe(false);
    expect(matchesActivityFilter(invite, { category: 'audit' })).toBe(true);
    expect(matchesActivityFilter(task, { teamId: 't-other' })).toBe(false);
    expect(matchesActivityFilter(task, { actorId: 'u2' })).toBe(false);
    expect(matchesActivityFilter(task, { group: 'tasks', since: 40 })).toBe(true);
    expect(matchesActivityFilter(task, { group: 'files' })).toBe(false);
    expect(matchesActivityFilter(task, { since: 60 })).toBe(false);
  });

  it('lists the events of one entity newest first', () => {
    const events = [
      event('created', { entity: { type: 'task', id: 'NS-1' }, occurredAt: 1 }),
      event('moved', { entity: { type: 'task', id: 'NS-1' }, occurredAt: 5 }),
      event('other', { entity: { type: 'task', id: 'NS-2' } }),
    ];

    expect(entityEventsOf(events, 'task', 'NS-1').map(({ id }) => id)).toEqual([
      'moved',
      'created',
    ]);
  });
});
