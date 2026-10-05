import { dueLabelOf } from '../../shared/pipes/time-format';

export type TaskStatus = 'backlog' | 'todo' | 'progress' | 'review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Subtask {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

export interface Task {
  readonly workspaceId: string;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId: string | null;
  readonly dueAt: number;
  readonly labels: readonly string[];
  readonly teamId: string | null;
  readonly subtasks: readonly Subtask[];
  readonly reporterId: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly pending: boolean;
}

export type NewTask = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueAt' | 'teamId'
>;

export type TaskChanges = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'priority'
    | 'assigneeId'
    | 'dueAt'
    | 'labels'
    | 'teamId'
    | 'subtasks'
  >
>;

export interface TaskColumn {
  readonly status: TaskStatus;
  readonly label: string;
}

export const TASK_COLUMNS: readonly TaskColumn[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'Todo' },
  { status: 'progress', label: 'In progress' },
  { status: 'review', label: 'Review' },
  { status: 'done', label: 'Done' },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  progress: 'In progress',
  review: 'Review',
  done: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TASK_PRIORITIES: readonly TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

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

export interface TaskComment {
  readonly id: string;
  readonly taskId: string;
  readonly authorId: string;
  readonly text: string;
  readonly createdAt: number;
  readonly edited: boolean;
}

export interface TaskHistoryEntry {
  readonly id: string;
  readonly taskId: string;
  readonly actorId: string;
  readonly text: string;
  readonly at: number;
}

export const isTaskStatus = (value: string): value is TaskStatus =>
  TASK_COLUMNS.some((column) => column.status === value);

export const isTaskPriority = (value: string): value is TaskPriority =>
  TASK_PRIORITIES.some((priority) => priority === value);

export const isTaskOverdue = (task: Task, now = Date.now()): boolean =>
  task.status !== 'done' && dueLabelOf(task.dueAt, now).overdue;

export const overdueDaysOf = (task: Task, now = Date.now()): number =>
  Math.max(1, -dueLabelOf(task.dueAt, now).daysFromToday);

export const overdueLabelOf = (days: number): string =>
  days === 1 ? '1 day overdue' : `${days} days overdue`;

export const dueReminderOf = (task: Task, now = Date.now()): string | null => {
  if (task.status === 'done') {
    return null;
  }
  const days = dueLabelOf(task.dueAt, now).daysFromToday;
  if (days > 1) {
    return null;
  }
  if (days < 0) {
    return `${task.id} is ${overdueLabelOf(-days)}`;
  }
  return days === 0 ? `${task.id} is due today` : `${task.id} is due tomorrow`;
};
