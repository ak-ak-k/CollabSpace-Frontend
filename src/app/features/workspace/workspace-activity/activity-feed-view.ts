import { activityChangeText, ActivityEvent, ActivityGroup } from '../../../core/models/activity';
import { User } from '../../../core/models/user';
import { ActivityFilter } from '../../../core/state/activity-filter';
import { isSameDay, startOfDay } from '../../../shared/pipes/time-format';
import { RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectOption } from '../../../shared/ui/select/select.component';
import { formatAuditTime } from '../workspace-settings/audit-log-view';
import { OverviewActivityItem, overviewActivityItem } from '../workspace-overview/overview-view';

export type ActivityOwner = 'all' | 'mine';
export type ActivityDateRange = 'any' | 'today' | '7' | '30';
export type ActivityType = ActivityGroup | 'all';
export type ActivityDayLabel = 'Today' | 'Yesterday' | 'Earlier';

export interface ActivityFeedFilters {
  readonly owner: ActivityOwner;
  readonly teamId: string;
  readonly range: ActivityDateRange;
  readonly type: ActivityType;
}

export interface ActivityTypeChip {
  readonly value: ActivityType;
  readonly label: string;
}

export interface ActivityFeedItem extends OverviewActivityItem {
  readonly context: string;
  readonly iso: string;
  readonly fullTime: string;
}

export interface ActivityDayGroup {
  readonly label: ActivityDayLabel;
  readonly items: readonly ActivityFeedItem[];
}

export interface ActivityEmptyCopy {
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
}

export interface ActivityTeam {
  readonly id: string;
  readonly name: string;
}

export interface ActivityFeedContext {
  readonly usersById: ReadonlyMap<string, User>;
  readonly viewerId: string;
  readonly teamNameOf: (teamId: string) => string | null;
  readonly now: number;
}

export const ACTIVITY_PAGE_SIZE = 30;
export const ALL_TEAMS = '';
export const DEFAULT_ACTIVITY_FEED_FILTERS: ActivityFeedFilters = {
  owner: 'all',
  teamId: ALL_TEAMS,
  range: 'any',
  type: 'all',
};

const MILLISECONDS_PER_DAY = 86_400_000;
const CONTEXT_SEPARATOR = ' · ';

export const ACTIVITY_OWNER_OPTIONS: readonly RadioOption[] = [
  { value: 'all', label: 'All activity' },
  { value: 'mine', label: 'My activity' },
];

export const ACTIVITY_DATE_OPTIONS: readonly RadioOption[] = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
];

export const ACTIVITY_TYPE_CHIPS: readonly ActivityTypeChip[] = [
  { value: 'all', label: 'All' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'teams', label: 'Teams & channels' },
  { value: 'files', label: 'Files' },
  { value: 'members', label: 'Members' },
];

const SINCE_BY_RANGE: Record<ActivityDateRange, (now: number) => number> = {
  any: () => 0,
  today: startOfDay,
  '7': (now) => now - 7 * MILLISECONDS_PER_DAY,
  '30': (now) => now - 30 * MILLISECONDS_PER_DAY,
};

export const isActivityOwner = (value: string): value is ActivityOwner =>
  ACTIVITY_OWNER_OPTIONS.some((option) => option.value === value);

export const isActivityDateRange = (value: string): value is ActivityDateRange =>
  Object.hasOwn(SINCE_BY_RANGE, value);

export const activitySinceOf = (range: ActivityDateRange, now: number): number =>
  SINCE_BY_RANGE[range](now);

export const isActivityFiltered = (filters: ActivityFeedFilters): boolean =>
  filters.owner !== DEFAULT_ACTIVITY_FEED_FILTERS.owner ||
  filters.teamId !== DEFAULT_ACTIVITY_FEED_FILTERS.teamId ||
  filters.range !== DEFAULT_ACTIVITY_FEED_FILTERS.range ||
  filters.type !== DEFAULT_ACTIVITY_FEED_FILTERS.type;

export const activityFilterOf = (
  filters: ActivityFeedFilters,
  viewerId: string,
  now: number,
): ActivityFilter => ({
  category: 'activity',
  teamId: filters.teamId || undefined,
  actorId: filters.owner === 'mine' ? viewerId : undefined,
  group: filters.type === 'all' ? undefined : filters.type,
  since: activitySinceOf(filters.range, now) || undefined,
});

export const activityTeamOptions = (teams: readonly ActivityTeam[]): readonly SelectOption[] => [
  { value: ALL_TEAMS, label: 'All teams' },
  ...teams.map((team) => ({ value: team.id, label: team.name })),
];

export const activityDayLabelOf = (timestamp: number, now: number): ActivityDayLabel => {
  if (isSameDay(timestamp, now)) {
    return 'Today';
  }
  return isSameDay(timestamp, now - MILLISECONDS_PER_DAY) ? 'Yesterday' : 'Earlier';
};

export const activityFeedItemOf = (
  event: ActivityEvent,
  { usersById, viewerId, teamNameOf, now }: ActivityFeedContext,
): ActivityFeedItem => {
  const teamName = event.teamId ? teamNameOf(event.teamId) : null;
  return {
    ...overviewActivityItem(event, usersById, viewerId, now),
    context: [teamName, activityChangeText(event.change)].filter(Boolean).join(CONTEXT_SEPARATOR),
    iso: new Date(event.occurredAt).toISOString(),
    fullTime: formatAuditTime(event.occurredAt),
  };
};

export const activityDayGroupsOf = (
  events: readonly ActivityEvent[],
  context: ActivityFeedContext,
): readonly ActivityDayGroup[] => {
  const groups = new Map<ActivityDayLabel, ActivityFeedItem[]>();
  for (const event of events) {
    const label = activityDayLabelOf(event.occurredAt, context.now);
    const items = groups.get(label) ?? [];
    items.push(activityFeedItemOf(event, context));
    groups.set(label, items);
  }
  return [...groups].map(([label, items]) => ({ label, items }));
};

export const activityEmptyCopyOf = (filtered: boolean): ActivityEmptyCopy =>
  filtered
    ? {
        heading: 'No activity matches these filters',
        message: 'Try another team, type or date range.',
        actionLabel: 'Clear filters',
      }
    : {
        heading: 'No activity yet',
        message: 'Activity will appear here as your team works together.',
        actionLabel: '',
      };
