import { ActivityRow } from '../../../core/state/activity-row';
import { isSameDay } from '../../pipes/time-format';

export interface ActivityFeedGroupOptions {
  readonly grouped: boolean;
  readonly label: string;
  readonly idPrefix: string;
  readonly now: number;
}

export interface ActivityFeedGroup {
  readonly key: string;
  readonly heading: string | null;
  readonly headingId: string | null;
  readonly listLabel: string;
  readonly rows: readonly ActivityRow[];
}

const MILLISECONDS_PER_DAY = 86_400_000;
const DAY_HEADING_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
};
const UNGROUPED_KEY = 'all';

export const activityDayHeadingOf = (timestamp: number, now: number): string => {
  if (isSameDay(timestamp, now)) {
    return 'Today';
  }
  if (isSameDay(timestamp, now - MILLISECONDS_PER_DAY)) {
    return 'Yesterday';
  }
  return new Date(timestamp).toLocaleDateString('en-GB', DAY_HEADING_FORMAT);
};

const groupedByDay = (
  rows: readonly ActivityRow[],
  now: number,
): ReadonlyMap<string, readonly ActivityRow[]> => {
  const days = new Map<string, ActivityRow[]>();
  for (const row of rows) {
    const heading = activityDayHeadingOf(row.occurredAt, now);
    days.set(heading, [...(days.get(heading) ?? []), row]);
  }
  return days;
};

export const activityFeedGroupsOf = (
  rows: readonly ActivityRow[],
  { grouped, label, idPrefix, now }: ActivityFeedGroupOptions,
): readonly ActivityFeedGroup[] => {
  if (rows.length === 0) {
    return [];
  }
  if (!grouped) {
    return [{ key: UNGROUPED_KEY, heading: null, headingId: null, listLabel: label, rows }];
  }
  return [...groupedByDay(rows, now)].map(([heading, dayRows], index) => ({
    key: heading,
    heading,
    headingId: `af-${idPrefix}-${index}`,
    listLabel: `${label}, ${heading}`,
    rows: dayRows,
  }));
};
