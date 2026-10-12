import {
  ACTIVITY_DATE_OPTIONS,
  ACTIVITY_TYPE_CHIPS,
  activityCountLabel,
  activityEmptyCopyOf,
  activityFilterOf,
  activityPersonOptions,
  DEFAULT_ACTIVITY_FILTERS,
  isActivityFiltered,
} from './activity-page-view';

const NOW = new Date(2026, 9, 6, 15, 0).getTime();
const DAY = 86_400_000;
const NAMES: Readonly<Record<string, string>> = {
  u0: 'Aarav Shah',
  u2: 'Rahul Mehta',
  u4: 'Kavya Reddy',
};

describe('activity page view', () => {
  it('offers the design’s type chips and date choices', () => {
    expect(ACTIVITY_TYPE_CHIPS.map((chip) => chip.label)).toEqual([
      'All types',
      'Tasks',
      'Teams & channels',
      'Files',
      'Members',
    ]);
    expect(ACTIVITY_DATE_OPTIONS.map((option) => option.label)).toEqual([
      'Any time',
      'Today',
      'Last 7 days',
      'Last 30 days',
    ]);
  });

  it('turns the filters into a stream filter, preferring My activity over a person', () => {
    expect(activityFilterOf(DEFAULT_ACTIVITY_FILTERS, 'u0', NOW)).toEqual({
      category: 'activity',
      teamId: undefined,
      actorId: undefined,
      group: undefined,
      since: undefined,
    });
    expect(
      activityFilterOf(
        { owner: 'all', teamId: 't1', personId: 'u2', range: 'today', type: 'files' },
        'u0',
        NOW,
      ),
    ).toEqual({
      category: 'activity',
      teamId: 't1',
      actorId: 'u2',
      group: 'files',
      since: new Date(2026, 9, 6).getTime(),
    });
    expect(
      activityFilterOf({ ...DEFAULT_ACTIVITY_FILTERS, owner: 'mine', range: '7' }, 'u0', NOW),
    ).toMatchObject({ actorId: 'u0', since: NOW - 7 * DAY });
  });

  it('lists other known actors once, sorted by name', () => {
    const events = [{ actorId: 'u4' }, { actorId: 'u0' }, { actorId: 'u2' }, { actorId: 'u4' }];

    expect(activityPersonOptions(events, 'u0', (id) => NAMES[id] ?? null)).toEqual([
      { value: '', label: 'Anyone' },
      { value: 'u4', label: 'Kavya Reddy' },
      { value: 'u2', label: 'Rahul Mehta' },
    ]);
  });

  it('explains empty results and counts what is shown', () => {
    expect(isActivityFiltered(DEFAULT_ACTIVITY_FILTERS)).toBe(false);
    expect(isActivityFiltered({ ...DEFAULT_ACTIVITY_FILTERS, personId: 'u2' })).toBe(true);
    expect(activityEmptyCopyOf(true)).toMatchObject({
      heading: 'No activity matches these filters',
      message: 'Try another type, team, person or date.',
      actionLabel: 'Clear filters',
    });
    expect(activityEmptyCopyOf(false).heading).toBe('No activity yet');
    expect(activityCountLabel(30, 72)).toBe('Showing 30 of 72 events');
    expect(activityCountLabel(30, 1)).toBe('Showing 1 of 1 event');
    expect(activityCountLabel(30, 0)).toBe('');
  });
});
