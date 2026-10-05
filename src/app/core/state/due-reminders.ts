import { AppNotification } from '../models/notification';
import { dueReminderOf, isTaskOverdue, Task } from '../models/task';

export interface DueReminderContext {
  readonly currentUserId: string;
  readonly now: number;
  readonly knownIds: ReadonlySet<string>;
}

const REMINDER_ID_PREFIX = 'due-';
const REMINDER_BACKDATE_MS = 60_000;
const TASK_ROUTE = '/tasks?task=';
const DATE_PART_WIDTH = 2;

const padded = (value: number): string => String(value).padStart(DATE_PART_WIDTH, '0');

export const dayKeyOf = (timestamp: number): string => {
  const day = new Date(timestamp);
  return `${day.getFullYear()}-${padded(day.getMonth() + 1)}-${padded(day.getDate())}`;
};

export const dueReminderIdOf = (taskId: string, now: number): string =>
  `${REMINDER_ID_PREFIX}${taskId}-${dayKeyOf(now)}`;

const reminderFor = (task: Task, text: string, now: number): AppNotification => {
  const overdue = isTaskOverdue(task, now);
  return {
    id: dueReminderIdOf(task.id, now),
    workspaceId: task.workspaceId,
    category: 'task',
    actorId: null,
    text,
    snippet: task.title,
    createdAt: now - REMINDER_BACKDATE_MS,
    read: false,
    route: `${TASK_ROUTE}${task.id}`,
    icon: overdue ? 'circle-alert' : 'calendar',
  };
};

export const dueRemindersFor = (
  tasks: readonly Task[],
  context: DueReminderContext,
): AppNotification[] =>
  tasks
    .filter((task) => task.assigneeId === context.currentUserId)
    .filter((task) => !context.knownIds.has(dueReminderIdOf(task.id, context.now)))
    .flatMap((task) => {
      const text = dueReminderOf(task, context.now);
      return text ? [reminderFor(task, text, context.now)] : [];
    });
