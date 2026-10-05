import {
  isTaskOverdue,
  Task,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskPriority,
  TaskStatus,
} from '../../core/models/task';
import { startOfDay } from '../../shared/pipes/time-format';

export type DueFilter = 'any' | 'overdue' | 'week';
export type TaskSort = 'due' | 'priority' | 'updated' | 'created';
export type TaskLayout = 'board' | 'list';

export const NO_TEAM = 'none';
export const ALL_TEAMS = '';

export interface TaskFilters {
  readonly statuses: readonly TaskStatus[];
  readonly priorities: readonly TaskPriority[];
  readonly labels: readonly string[];
  readonly due: DueFilter;
}

export interface TaskCriteria {
  readonly query: string;
  readonly assigneeIds: readonly string[];
  readonly teamId: string;
  readonly filters: TaskFilters;
}

export type TaskChipRemoval =
  | { readonly kind: 'team' }
  | { readonly kind: 'due' }
  | { readonly kind: 'status'; readonly value: TaskStatus }
  | { readonly kind: 'priority'; readonly value: TaskPriority }
  | { readonly kind: 'label'; readonly value: string }
  | { readonly kind: 'assignee'; readonly value: string };

export interface TaskFilterChip {
  readonly key: string;
  readonly label: string;
  readonly removeLabel: string;
  readonly removal: TaskChipRemoval;
}

export interface ChipNames {
  readonly team: (teamId: string) => string;
  readonly assignee: (userId: string) => string;
}

export const EMPTY_FILTERS: TaskFilters = { statuses: [], priorities: [], labels: [], due: 'any' };

export const DUE_FILTER_LABELS: Record<DueFilter, string> = {
  any: 'Any time',
  overdue: 'Overdue',
  week: 'Due this week',
};

export const SORT_LABELS: Record<TaskSort, string> = {
  due: 'Due date',
  priority: 'Priority',
  updated: 'Recently updated',
  created: 'Newest first',
};

const SORT_CAPTIONS: Record<TaskSort, string> = {
  due: 'due date',
  priority: 'priority',
  updated: 'last update',
  created: 'newest first',
};

const DAY = 86_400_000;
const WEEK_DAYS = 7;

export const isDueFilter = (value: string): value is DueFilter =>
  Object.hasOwn(DUE_FILTER_LABELS, value);
export const isTaskSort = (value: string): value is TaskSort => Object.hasOwn(SORT_LABELS, value);

export const toggled = <Value>(list: readonly Value[], value: Value): Value[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const matchesQuery = (task: Task, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    [task.title, task.id, task.description].some((text) => text.toLowerCase().includes(needle))
  );
};

const matchesTeam = (task: Task, teamId: string): boolean =>
  teamId === ALL_TEAMS || (teamId === NO_TEAM ? task.teamId === null : task.teamId === teamId);

const matchesDue = (task: Task, due: DueFilter, now: number): boolean => {
  if (due === 'any') {
    return true;
  }
  if (due === 'overdue') {
    return isTaskOverdue(task, now);
  }
  const today = startOfDay(now);
  return task.dueAt >= today && task.dueAt < today + WEEK_DAYS * DAY;
};

const includesOrEmpty = <Value>(list: readonly Value[], value: Value): boolean =>
  list.length === 0 || list.includes(value);

export const matchesTask = (task: Task, criteria: TaskCriteria, now = Date.now()): boolean => {
  const { filters } = criteria;
  return (
    matchesQuery(task, criteria.query) &&
    (criteria.assigneeIds.length === 0 ||
      (task.assigneeId !== null && criteria.assigneeIds.includes(task.assigneeId))) &&
    includesOrEmpty(filters.statuses, task.status) &&
    includesOrEmpty(filters.priorities, task.priority) &&
    matchesTeam(task, criteria.teamId) &&
    (filters.labels.length === 0 || filters.labels.some((label) => task.labels.includes(label))) &&
    matchesDue(task, filters.due, now)
  );
};

export const activeFilterCount = (filters: TaskFilters, teamId: string): number =>
  filters.statuses.length +
  filters.priorities.length +
  filters.labels.length +
  (filters.due === 'any' ? 0 : 1) +
  (teamId === ALL_TEAMS ? 0 : 1);

export const isFiltered = (criteria: TaskCriteria): boolean =>
  criteria.query.trim() !== '' ||
  criteria.assigneeIds.length > 0 ||
  activeFilterCount(criteria.filters, criteria.teamId) > 0;

const priorityRank = (priority: TaskPriority): number => TASK_PRIORITIES.indexOf(priority);
const doneLast = (task: Task): number => (task.status === 'done' ? 1 : 0);

const COMPARATORS: Record<TaskSort, (first: Task, second: Task) => number> = {
  due: (first, second) => doneLast(first) - doneLast(second) || first.dueAt - second.dueAt,
  priority: (first, second) =>
    priorityRank(first.priority) - priorityRank(second.priority) || first.dueAt - second.dueAt,
  updated: (first, second) => second.updatedAt - first.updatedAt,
  created: (first, second) => second.createdAt - first.createdAt,
};

export const sortTasks = (tasks: readonly Task[], sort: TaskSort): Task[] =>
  [...tasks].sort(COMPARATORS[sort]);

export const listCaptionOf = (count: number, sort: TaskSort): string =>
  `${count} ${count === 1 ? 'task' : 'tasks'}, sorted by ${SORT_CAPTIONS[sort]}`;

const chip = (key: string, label: string, removal: TaskChipRemoval): TaskFilterChip => ({
  key,
  label,
  removeLabel: `Remove filter ${label}`,
  removal,
});

export const filterChips = (criteria: TaskCriteria, names: ChipNames): TaskFilterChip[] => {
  const { filters, teamId } = criteria;
  const team =
    teamId === ALL_TEAMS ? [] : [chip('team', `Team: ${names.team(teamId)}`, { kind: 'team' })];
  return [
    ...team,
    ...filters.statuses.map((value) =>
      chip(`status-${value}`, `Status: ${TASK_STATUS_LABELS[value]}`, { kind: 'status', value }),
    ),
    ...filters.priorities.map((value) =>
      chip(`priority-${value}`, `Priority: ${TASK_PRIORITY_LABELS[value]}`, {
        kind: 'priority',
        value,
      }),
    ),
    ...filters.labels.map((value) =>
      chip(`label-${value}`, `Label: ${value}`, { kind: 'label', value }),
    ),
    ...(filters.due === 'any'
      ? []
      : [chip('due', DUE_FILTER_LABELS[filters.due], { kind: 'due' })]),
    ...criteria.assigneeIds.map((value) =>
      chip(`assignee-${value}`, `Assignee: ${names.assignee(value)}`, { kind: 'assignee', value }),
    ),
  ];
};

export const withoutChip = (filters: TaskFilters, removal: TaskChipRemoval): TaskFilters => {
  switch (removal.kind) {
    case 'status':
      return { ...filters, statuses: toggled(filters.statuses, removal.value) };
    case 'priority':
      return { ...filters, priorities: toggled(filters.priorities, removal.value) };
    case 'label':
      return { ...filters, labels: toggled(filters.labels, removal.value) };
    case 'due':
      return { ...filters, due: 'any' };
    default:
      return filters;
  }
};
