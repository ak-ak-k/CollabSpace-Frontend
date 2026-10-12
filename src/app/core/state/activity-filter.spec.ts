import { ActivityEvent } from '../models/activity';
import {
  ActivityScope,
  ActivityVisibility,
  canSeeChannelActivity,
  canSeeTeamActivity,
  entityEventsOf,
  eventsInScope,
  isActivityVisible,
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
  action: 'task.created',
  meta: null,
  outcome: 'succeeded',
  audit: false,
  ...changes,
});

const scope: ActivityScope = {
  workspaceId: 'w1',
  hasTask: (taskId) => taskId !== 'gone',
  hasFile: (fileId) => fileId !== 'gone-file',
};

const visibility: ActivityVisibility = {
  canSeeTeam: (teamId) => teamId !== 't-secret',
  canSeeChannel: (channelId) => channelId !== 'c-secret',
};

describe('activity filter', () => {
  it('keeps the current workspace, newest first', () => {
    const events = [
      event('old', { occurredAt: 1 }),
      event('new', { occurredAt: 30 }),
      event('other-workspace', { workspaceId: 'w2' }),
    ];

    expect(eventsInScope(events, scope).map(({ id }) => id)).toEqual(['new', 'old']);
  });

  it('marks events of deleted tasks and files and drops their links', () => {
    const [task, file] = eventsInScope(
      [
        event('gone', { entity: { type: 'task', id: 'gone' }, occurredAt: 2 }),
        event('Notes.pdf', { entity: { type: 'file', id: 'gone-file' }, occurredAt: 1 }),
      ],
      scope,
    );

    expect(task).toMatchObject({ object: 'gone (deleted)', route: '' });
    expect(file).toMatchObject({ object: 'Notes.pdf (deleted)', route: '' });
  });

  it('hides private teams and channels I am not in, and every other team from guests', () => {
    const secretTeam = { isPrivate: true, memberIds: ['u2'] };
    const openTeam = { isPrivate: false, memberIds: ['u2'] };

    expect(canSeeTeamActivity(secretTeam, 'u1', false)).toBe(false);
    expect(canSeeTeamActivity({ ...secretTeam, memberIds: ['u1'] }, 'u1', false)).toBe(true);
    expect(canSeeTeamActivity(openTeam, 'u1', false)).toBe(true);
    expect(canSeeTeamActivity(openTeam, 'u1', true)).toBe(false);
    expect(canSeeTeamActivity(null, 'u1', true)).toBe(true);
    expect(canSeeChannelActivity({ isPrivate: true, memberIds: [] }, 'u1')).toBe(false);
    expect(canSeeChannelActivity({ isPrivate: false, memberIds: [] }, 'u1')).toBe(true);
    expect(isActivityVisible(event('a', { teamId: 't-secret' }), visibility)).toBe(false);
    expect(
      isActivityVisible(event('b', { entity: { type: 'channel', id: 'c-secret' } }), visibility),
    ).toBe(false);
    expect(isActivityVisible(event('c', { teamId: 't-open' }), visibility)).toBe(true);
  });

  it('filters by category, team, actor, group and date, and lists audit-flagged events', () => {
    const task = event('task', { teamId: 't-open', occurredAt: 50 });
    const invite = event('invite', { kind: 'invite', category: 'audit' });
    const archived = event('archived', { kind: 'team', audit: true });

    expect(matchesActivityFilter(task, {})).toBe(true);
    expect(matchesActivityFilter(invite, {})).toBe(false);
    expect(matchesActivityFilter(invite, { category: 'audit' })).toBe(true);
    expect(matchesActivityFilter(archived, {})).toBe(true);
    expect(matchesActivityFilter(archived, { category: 'audit' })).toBe(true);
    expect(matchesActivityFilter(task, { category: 'audit' })).toBe(false);
    expect(matchesActivityFilter(task, { teamId: 't-other' })).toBe(false);
    expect(matchesActivityFilter(task, { actorId: 'u2' })).toBe(false);
    expect(matchesActivityFilter(task, { group: 'tasks', since: 40 })).toBe(true);
    expect(matchesActivityFilter(task, { group: 'files' })).toBe(false);
    expect(matchesActivityFilter(task, { since: 60 })).toBe(false);
  });

  it('lists the activity of one entity, leaving out audit-only entries', () => {
    const events = [
      event('moved', { entity: { type: 'task', id: 'NS-1' }, occurredAt: 5 }),
      event('created', { entity: { type: 'task', id: 'NS-1' }, occurredAt: 1 }),
      event('audited', { entity: { type: 'task', id: 'NS-1' }, category: 'audit' }),
      event('other', { entity: { type: 'task', id: 'NS-2' } }),
    ];

    expect(entityEventsOf(events, 'task', 'NS-1').map(({ id }) => id)).toEqual([
      'moved',
      'created',
    ]);
  });
});
