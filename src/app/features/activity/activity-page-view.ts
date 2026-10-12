import { ActivityEvent, ActivityGroup } from '../../core/models/activity';
import { ActivityFilter } from '../../core/state/activity-filter';
import { startOfDay } from '../../shared/pipes/time-format';
import { RadioOption } from '../../shared/ui/radio/radio-group.component';
import { SelectOption } from '../../shared/ui/select/select.component';

export type ActivityOwner = 'all' | 'mine';
export type ActivityDateRange = 'any' | 'today' | '7' | '30';
export type ActivityType = ActivityGroup | 'all';

export interface ActivityPageFilters {
  readonly owner: ActivityOwner;
  readonly teamId: string;
  readonly personId: string;
  readonly range: ActivityDateRange;
  readonly type: ActivityType;
}

export interface ActivityTypeChip {
  readonly value: ActivityType;
  readonly label: string;
}

export interface ActivityEmptyCopy {
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
}

export interface ActivityTeamChoice {
  readonly id: string;
  readonly name: string;
}

export type ActivityNameOf = (userId: string) => string | null;

export const ACTIVITY_PAGE_SIZE = 30;
export const ALL_TEAMS = '';
export const ANYONE = '';
export const DEFAULT_ACTIVITY_FILTERS: ActivityPageFilters = {
  owner: 'all',
  teamId: ALL_TEAMS,
  personId: ANYONE,
  range: 'any',
  type: 'all',
};

const MILLISECONDS_PER_DAY = 86_400_000;

export const ACTIVITY_OWNER_OPTIONS: readonly RadioOption[] = [
  { value: 'all', label: 'All activity' },
  { value: 'mine', label: 'My activity' },
];

export const ACTIVITY_DATE_OPTIONS: readonly SelectOption[] = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

export const ACTIVITY_TYPE_CHIPS: readonly ActivityTypeChip[] = [
  { value: 'all', label: 'All types' },
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

export const isActivityFiltered = (filters: ActivityPageFilters): boolean =>
  (Object.keys(DEFAULT_ACTIVITY_FILTERS) as (keyof ActivityPageFilters)[]).some(
    (key) => filters[key] !== DEFAULT_ACTIVITY_FILTERS[key],
  );

const actorFilterOf = (filters: ActivityPageFilters, viewerId: string): string | undefined =>
  filters.owner === 'mine' ? viewerId : filters.personId || undefined;

export const activityFilterOf = (
  filters: ActivityPageFilters,
  viewerId: string,
  now: number,
): ActivityFilter => ({
  category: 'activity',
  teamId: filters.teamId || undefined,
  actorId: actorFilterOf(filters, viewerId),
  group: filters.type === 'all' ? undefined : filters.type,
  since: SINCE_BY_RANGE[filters.range](now) || undefined,
});

export const activityTeamOptions = (
  teams: readonly ActivityTeamChoice[],
): readonly SelectOption[] => [
  { value: ALL_TEAMS, label: 'All teams' },
  ...teams.map((team) => ({ value: team.id, label: team.name })),
];

export const activityPersonOptions = (
  events: readonly Pick<ActivityEvent, 'actorId'>[],
  viewerId: string,
  nameOf: ActivityNameOf,
): readonly SelectOption[] => {
  const people = [...new Set(events.map((event) => event.actorId))]
    .filter((actorId) => actorId !== viewerId)
    .flatMap((actorId) => {
      const name = nameOf(actorId);
      return name ? [{ value: actorId, label: name }] : [];
    })
    .sort((first, second) => first.label.localeCompare(second.label));
  return [{ value: ANYONE, label: 'Anyone' }, ...people];
};

export const activityEmptyCopyOf = (filtered: boolean): ActivityEmptyCopy =>
  filtered
    ? {
        heading: 'No activity matches these filters',
        message: 'Try another type, team, person or date.',
        actionLabel: 'Clear filters',
      }
    : {
        heading: 'No activity yet',
        message: 'Activity will appear here as your team works together.',
        actionLabel: '',
      };

export const activityCountLabel = (shown: number, total: number): string =>
  total ? `Showing ${Math.min(shown, total)} of ${total} ${total === 1 ? 'event' : 'events'}` : '';
