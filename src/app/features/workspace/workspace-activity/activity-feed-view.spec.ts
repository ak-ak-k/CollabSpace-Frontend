import { ActivityEvent } from '../../../core/models/activity';
import { User } from '../../../core/models/user';
import {
  ACTIVITY_DATE_OPTIONS,
  ACTIVITY_TYPE_CHIPS,
  activityDayGroupsOf,
  activityEmptyCopyOf,
  ActivityFeedContext,
  activityFilterOf,
  activityTeamOptions,
  DEFAULT_ACTIVITY_FEED_FILTERS,
  isActivityDateRange,
  isActivityFiltered,
} from './activity-feed-view';

const NOW = new Date(2026, 9, 6, 15, 0).getTime();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const feedEvent = (id: string, changes: Partial<ActivityEvent> = {}): ActivityEvent => ({
  id,
  workspaceId: 'w1',
  actorId: 'u2',
  verb: 'moved',
  object: 'NS-142 to In progress',
  occurredAt: NOW - HOUR,
  kind: 'task',
  route: '/tasks/ns-142',
  category: 'activity',
  entity: null,
  teamId: 't-frontend',
  change: null,
  ...changes,
});

const person = (id: string, name: string): User => ({
  id,
  name,
  title: 'Engineer',
  department: 'Engineering',
  email: `${id}@northstar.io`,
  status: 'online',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST · UTC+5:30',
  location: 'Pune, India',
  role: 'member',
});

const users = new Map<string, User>([
  ['u0', person('u0', 'Aarav Shah')],
  ['u2', person('u2', 'Rahul Mehta')],
]);

const context: ActivityFeedContext = {
  usersById: users,
  viewerId: 'u0',
  teamNameOf: (teamId) => (teamId === 't-frontend' ? 'Frontend' : null),
  now: NOW,
};

describe('activity feed view', () => {
  it('offers the type chips and recognises date ranges', () => {
    expect(ACTIVITY_TYPE_CHIPS.map((chip) => chip.label)).toEqual([
      'All',
      'Tasks',
      'Teams & channels',
      'Files',
      'Members',
    ]);
    expect(ACTIVITY_DATE_OPTIONS.map((option) => option.label)).toEqual([
      'Any time',
      'Today',
      '7 days',
      '30 days',
    ]);
    expect(isActivityDateRange('today')).toBe(true);
    expect(isActivityDateRange('90')).toBe(false);
    expect(activityTeamOptions([{ id: 't1', name: 'Design' }])).toEqual([
      { value: '', label: 'All teams' },
      { value: 't1', label: 'Design' },
    ]);
  });

  it('turns the chosen filters into an activity stream filter', () => {
    expect(activityFilterOf(DEFAULT_ACTIVITY_FEED_FILTERS, 'u0', NOW)).toEqual({
      category: 'activity',
      teamId: undefined,
      actorId: undefined,
      group: undefined,
      since: undefined,
    });
    expect(
      activityFilterOf({ owner: 'mine', teamId: 't1', range: 'today', type: 'files' }, 'u0', NOW),
    ).toEqual({
      category: 'activity',
      teamId: 't1',
      actorId: 'u0',
      group: 'files',
      since: new Date(2026, 9, 6).getTime(),
    });
    expect(
      activityFilterOf({ ...DEFAULT_ACTIVITY_FEED_FILTERS, range: '7' }, 'u0', NOW).since,
    ).toBe(NOW - 7 * DAY);
  });

  it('groups events into Today, Yesterday and Earlier with readable items', () => {
    const groups = activityDayGroupsOf(
      [
        feedEvent('a', { change: { from: 'Todo', to: 'In progress' } }),
        feedEvent('b', { actorId: 'u0', occurredAt: NOW - DAY, route: '', teamId: null }),
        feedEvent('c', { actorId: 'u9', occurredAt: NOW - 3 * DAY }),
      ],
      context,
    );

    expect(groups.map((group) => group.label)).toEqual(['Today', 'Yesterday', 'Earlier']);
    expect(groups[0].items[0]).toMatchObject({
      actorName: 'Rahul Mehta',
      context: 'Frontend · Todo → In progress',
      when: '1h ago',
      icon: 'square-kanban',
      fullTime: '6 Oct 2026, 14:00',
    });
    expect(groups[1].items[0]).toMatchObject({
      actorName: 'You',
      avatarName: 'Aarav Shah',
      route: '',
      context: '',
    });
    expect(groups[2].items[0]).toMatchObject({ actorName: 'Someone', avatarText: '?' });
  });

  it('explains an empty feed differently when filters are on', () => {
    expect(isActivityFiltered(DEFAULT_ACTIVITY_FEED_FILTERS)).toBe(false);
    expect(isActivityFiltered({ ...DEFAULT_ACTIVITY_FEED_FILTERS, type: 'tasks' })).toBe(true);
    expect(activityEmptyCopyOf(false)).toMatchObject({
      heading: 'No activity yet',
      actionLabel: '',
    });
    expect(activityEmptyCopyOf(true)).toMatchObject({
      heading: 'No activity matches these filters',
      actionLabel: 'Clear filters',
    });
  });
});
