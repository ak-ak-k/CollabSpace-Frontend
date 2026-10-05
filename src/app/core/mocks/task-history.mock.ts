import { TASK_STATUS_LABELS, TaskHistoryEntry, TaskStatus } from '../models/task';
import { minutesAgo } from './mock-clock';
import { TASK_SEEDS, TaskSeed } from './task-seeds.mock';
import { taskCreatedAtOf, taskReporterOf } from './tasks.mock';

const STARTED_STATUSES: readonly TaskStatus[] = ['progress', 'review', 'done'];
const MINUTES_PER_HOUR = 60;
const STATUS_CHANGE_OFFSET_HOURS = 2;

const createdEntry = (taskSeed: TaskSeed, index: number): TaskHistoryEntry => ({
  id: `${taskSeed.id}-h0`,
  taskId: taskSeed.id,
  actorId: taskReporterOf(index),
  text: 'created this task',
  at: taskCreatedAtOf(index),
});

const statusEntry = (taskSeed: TaskSeed, index: number): TaskHistoryEntry => ({
  id: `${taskSeed.id}-h1`,
  taskId: taskSeed.id,
  actorId: taskSeed.assigneeId ?? taskReporterOf(index),
  text: `changed status: Todo → ${TASK_STATUS_LABELS[taskSeed.status]}`,
  at: minutesAgo(MINUTES_PER_HOUR * (index + STATUS_CHANGE_OFFSET_HOURS)),
});

const historyOf = (taskSeed: TaskSeed, index: number): TaskHistoryEntry[] =>
  STARTED_STATUSES.includes(taskSeed.status)
    ? [createdEntry(taskSeed, index), statusEntry(taskSeed, index)]
    : [createdEntry(taskSeed, index)];

export const MOCK_TASK_HISTORY: readonly TaskHistoryEntry[] = TASK_SEEDS.flatMap(historyOf);
