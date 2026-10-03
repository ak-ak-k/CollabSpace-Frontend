import {
  Task,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TaskPriority,
  TaskStatus,
} from '../../core/models/task';
import { User, userColorSeed } from '../../core/models/user';
import { dueLabelOf, formatDate } from '../../shared/pipes/time-format';
import { PRIORITY_TAG_TONES, TagTone } from '../../shared/ui/tag/tag.component';

export type DueState = 'overdue' | 'soon' | 'later' | 'done';
export type PriorityFilter = TaskPriority | 'all';

export interface TaskPerson {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
}

export interface TaskCardView {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly priorityLabel: string;
  readonly priorityTone: TagTone;
  readonly labels: readonly string[];
  readonly dueLabel: string;
  readonly dueState: DueState;
  readonly commentCount: number;
  readonly attachmentCount: number;
  readonly assignee: TaskPerson | null;
  readonly done: boolean;
  readonly accessibleLabel: string;
}

export interface TaskFilters {
  readonly query: string;
  readonly assigneeIds: readonly string[];
  readonly priority: PriorityFilter;
}

export const TASK_LABELS: readonly string[] = [
  'Frontend',
  'API',
  'Design',
  'Bug',
  'Mobile',
  'Research',
  'Performance',
  'Accessibility',
  'Content',
];

const SPRINT_NAME = 'Atlas Web · Sprint 24';
const SPRINT_DAYS_BEFORE = 7;
const SPRINT_DAYS_AFTER = 6;
const DAY = 86_400_000;

export const sprintKicker = (now = Date.now()): string => {
  const start = formatDate(now - SPRINT_DAYS_BEFORE * DAY, { day: 'numeric', month: 'short' });
  const end = formatDate(now + SPRINT_DAYS_AFTER * DAY, { day: 'numeric', month: 'short' });
  return `${SPRINT_NAME} · ${start} – ${end}`;
};

export const SPRINT_TITLE = SPRINT_NAME;

const dueStateOf = (task: Task): DueState => {
  if (task.status === 'done') {
    return 'done';
  }
  const due = dueLabelOf(task.dueAt);
  if (due.overdue) {
    return 'overdue';
  }
  return due.soon ? 'soon' : 'later';
};

export const personOf = (user: User | null): TaskPerson | null =>
  user ? { id: user.id, name: user.name, seed: userColorSeed(user.id) } : null;

export const taskCardView = (task: Task, assignee: User | null): TaskCardView => {
  const dueLabel = dueLabelOf(task.dueAt).label;
  const dueState = dueStateOf(task);
  const priorityLabel = TASK_PRIORITY_LABELS[task.priority];
  const overdueText = dueState === 'overdue' ? ', overdue' : '';
  const assigneeText = assignee ? `, assigned to ${assignee.name}` : '';
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priorityLabel,
    priorityTone: PRIORITY_TAG_TONES[task.priority],
    labels: task.labels,
    dueLabel,
    dueState,
    commentCount: task.commentCount,
    attachmentCount: task.attachmentCount,
    assignee: personOf(assignee),
    done: task.status === 'done',
    accessibleLabel: `${task.id}, ${task.title}, ${priorityLabel} priority, due ${dueLabel}${overdueText}${assigneeText}`,
  };
};

export const priorityFilterOf = (value: string): PriorityFilter =>
  TASK_PRIORITIES.find((priority) => priority === value) ?? 'all';

export const matchesFilters = (task: Task, filters: TaskFilters): boolean => {
  const query = filters.query.trim().toLowerCase();
  const matchesQuery =
    !query || task.title.toLowerCase().includes(query) || task.id.toLowerCase().includes(query);
  const matchesAssignee =
    filters.assigneeIds.length === 0 ||
    (task.assigneeId !== null && filters.assigneeIds.includes(task.assigneeId));
  const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
  return matchesQuery && matchesAssignee && matchesPriority;
};

export const assigneeIdsOf = (tasks: readonly Task[]): string[] => [
  ...new Set(tasks.map((task) => task.assigneeId).filter((id): id is string => id !== null)),
];

export const nextTaskIdInColumn = (tasks: readonly Task[], id: string): string | undefined => {
  const index = tasks.findIndex((task) => task.id === id);
  const status = tasks[index]?.status;
  return tasks.slice(index + 1).find((task) => task.status === status)?.id;
};
