export type TaskStatus = 'backlog' | 'todo' | 'progress' | 'review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId: string | null;
  readonly dueAt: number;
  readonly labels: readonly string[];
  readonly commentCount: number;
  readonly attachmentCount: number;
}

export type NewTask = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueAt'
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
