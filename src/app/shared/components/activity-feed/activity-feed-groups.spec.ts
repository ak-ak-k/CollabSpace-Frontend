import { ActivityRow } from '../../../core/state/activity-row';
import { activityDayHeadingOf, activityFeedGroupsOf } from './activity-feed-groups';

const NOW = new Date(2026, 9, 12, 15, 0).getTime();
const DAY = 86_400_000;

const row = (id: string, occurredAt: number): ActivityRow => ({
  id,
  kind: 'task',
  action: 'task.created',
  occurredAt,
  actor: {
    name: 'You',
    shortName: 'You',
    avatarName: 'Aarav Shah',
    avatarText: '',
    seed: 0,
    link: '/profile',
    label: 'View your profile',
  },
  verb: 'created',
  object: id,
  route: '',
  change: null,
  icon: 'square-kanban',
  typeLabel: 'Task',
  team: null,
  when: '',
  iso: '',
  fullTime: '',
  outcome: 'succeeded',
  outcomeLabel: 'Succeeded',
  metaText: '',
});

describe('activity feed groups', () => {
  it('names days Today, Yesterday or the full weekday and date', () => {
    expect(activityDayHeadingOf(NOW - 1000, NOW)).toBe('Today');
    expect(activityDayHeadingOf(NOW - DAY, NOW)).toBe('Yesterday');
    expect(activityDayHeadingOf(new Date(2026, 9, 5, 9).getTime(), NOW)).toBe('Monday 5 October');
  });

  it('groups rows by day with labelled lists and unique heading ids', () => {
    const groups = activityFeedGroupsOf(
      [row('a', NOW), row('b', NOW - 60_000), row('c', NOW - DAY)],
      { grouped: true, label: 'Activity', idPrefix: 'act', now: NOW },
    );

    expect(groups.map((group) => [group.heading, group.headingId, group.rows.length])).toEqual([
      ['Today', 'af-act-0', 2],
      ['Yesterday', 'af-act-1', 1],
    ]);
    expect(groups[1].listLabel).toBe('Activity, Yesterday');
  });

  it('keeps one unlabelled group when not grouped and none when empty', () => {
    const [only] = activityFeedGroupsOf([row('a', NOW)], {
      grouped: false,
      label: 'Team activity',
      idPrefix: 'g',
      now: NOW,
    });

    expect(only).toMatchObject({ heading: null, headingId: null, listLabel: 'Team activity' });
    expect(
      activityFeedGroupsOf([], { grouped: true, label: 'Activity', idPrefix: 'g', now: NOW }),
    ).toEqual([]);
  });
});
