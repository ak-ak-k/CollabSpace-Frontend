import {
  isTaskOverdue,
  overdueDaysOf,
  overdueLabelOf,
  Task,
  TASK_COLUMNS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskStatus,
} from '../../core/models/task';
import { User, userColorSeed } from '../../core/models/user';
import { subtaskProgressOf } from '../../core/state/task-subtasks';
import { dueLabelOf } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { PRIORITY_TAG_TONES, TagTone } from '../../shared/ui/tag/tag.component';

export type DueState = 'overdue' | 'soon' | 'later' | 'done';

export interface TaskPerson {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
}

export interface TaskCardView {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly statusLabel: string;
  readonly priorityLabel: string;
  readonly priorityTone: TagTone;
  readonly teamName: string | null;
  readonly labels: readonly string[];
  readonly shortLabels: readonly string[];
  readonly dueText: string;
  readonly dueIcon: IconName;
  readonly dueState: DueState;
  readonly subtaskLabel: string | null;
  readonly commentCount: number;
  readonly attachmentCount: number;
  readonly pending: boolean;
  readonly assignee: TaskPerson | null;
  readonly assigneeName: string;
  readonly done: boolean;
  readonly accessibleLabel: string;
  readonly idLine: string;
  readonly menuLabel: string;
  readonly menuTitle: string;
}

export interface TaskViewContext {
  readonly user: (userId: string | null) => User | null;
  readonly teamName: (teamId: string | null) => string | null;
  readonly commentCount: (taskId: string) => number;
  readonly attachmentCount: (taskId: string) => number;
  readonly now: number;
}

const CARD_LABEL_LIMIT = 2;
const SEPARATOR = ' · ';
const UNASSIGNED = 'Unassigned';

export const PENDING_SYNC_HINT = 'Saved offline — syncs when you reconnect';

export const personOf = (user: User | null): TaskPerson | null =>
  user ? { id: user.id, name: user.name, seed: userColorSeed(user.id) } : null;

const dueStateOf = (task: Task, now: number): DueState => {
  if (task.status === 'done') {
    return 'done';
  }
  if (isTaskOverdue(task, now)) {
    return 'overdue';
  }
  return dueLabelOf(task.dueAt, now).soon ? 'soon' : 'later';
};

const dueTextOf = (task: Task, state: DueState, now: number): string =>
  state === 'overdue'
    ? overdueLabelOf(overdueDaysOf(task, now))
    : dueLabelOf(task.dueAt, now).label;

const idLineOf = (task: Task, subtaskLabel: string | null): string =>
  [
    task.id,
    ...(subtaskLabel ? [`${subtaskLabel} subtasks`] : []),
    ...(task.labels.length ? [task.labels.join(', ')] : []),
  ].join(SEPARATOR);

const accessibleLabelOf = (task: Task, card: Omit<TaskCardView, 'accessibleLabel'>): string => {
  const progress = subtaskProgressOf(task.subtasks);
  const due = card.dueState === 'overdue' ? card.dueText : `due ${card.dueText}`;
  return [
    task.id,
    task.title,
    card.statusLabel,
    `${card.priorityLabel} priority`,
    due,
    card.assignee ? `assigned to ${card.assignee.name}` : 'unassigned',
    ...(progress.total ? [`${progress.done} of ${progress.total} subtasks done`] : []),
    ...(task.pending ? ['waiting to sync'] : []),
  ].join(', ');
};

export const taskCardView = (task: Task, context: TaskViewContext): TaskCardView => {
  const progress = subtaskProgressOf(task.subtasks);
  const subtaskLabel = progress.total ? `${progress.done}/${progress.total}` : null;
  const dueState = dueStateOf(task, context.now);
  const assignee = personOf(context.user(task.assigneeId));
  const card: Omit<TaskCardView, 'accessibleLabel'> = {
    id: task.id,
    title: task.title,
    status: task.status,
    statusLabel: TASK_STATUS_LABELS[task.status],
    priorityLabel: TASK_PRIORITY_LABELS[task.priority],
    priorityTone: PRIORITY_TAG_TONES[task.priority],
    teamName: context.teamName(task.teamId),
    labels: task.labels,
    shortLabels: task.labels.slice(0, CARD_LABEL_LIMIT),
    dueText: dueTextOf(task, dueState, context.now),
    dueIcon: dueState === 'overdue' ? 'circle-alert' : 'calendar',
    dueState,
    subtaskLabel,
    commentCount: context.commentCount(task.id),
    attachmentCount: context.attachmentCount(task.id),
    pending: task.pending,
    assignee,
    assigneeName: assignee?.name ?? UNASSIGNED,
    done: task.status === 'done',
    idLine: idLineOf(task, subtaskLabel),
    menuLabel: `Actions for ${task.id}`,
    menuTitle: `${task.id}${SEPARATOR}${task.title}`,
  };
  return { ...card, accessibleLabel: accessibleLabelOf(task, card) };
};

export const assigneeIdsOf = (tasks: readonly Task[]): string[] => [
  ...new Set(tasks.map((task) => task.assigneeId).filter((id): id is string => id !== null)),
];

export const nextTaskIdInColumn = (tasks: readonly Task[], id: string): string | undefined => {
  const index = tasks.findIndex((task) => task.id === id);
  const status = tasks[index]?.status;
  return tasks.slice(index + 1).find((task) => task.status === status)?.id;
};

export type TaskMenuItem =
  | {
      readonly kind: 'move';
      readonly key: string;
      readonly status: TaskStatus;
      readonly label: string;
      readonly icon: IconName;
    }
  | {
      readonly kind: 'copy-link';
      readonly key: string;
      readonly label: string;
      readonly icon: IconName;
    };

export const taskMenuItems = (status: TaskStatus): TaskMenuItem[] => [
  ...TASK_COLUMNS.filter((column) => column.status !== status).map((column): TaskMenuItem => ({
    kind: 'move',
    key: `move-${column.status}`,
    status: column.status,
    label: `Move to ${column.label}`,
    icon: 'arrow-right',
  })),
  { kind: 'copy-link', key: 'copy-link', label: 'Copy link', icon: 'link' },
];
