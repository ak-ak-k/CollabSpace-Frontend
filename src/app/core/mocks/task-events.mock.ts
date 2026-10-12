import { ActivityEvent } from '../models/activity';
import { TaskActivityAction } from '../models/activity-action';
import { TASK_STATUS_LABELS, taskRouteOf, TaskStatus } from '../models/task';
import { minutesAgo } from './mock-clock';
import { MOCK_TASKS, SeededTask } from './tasks.mock';

type TaskEventFields = Pick<
  ActivityEvent,
  'actorId' | 'verb' | 'object' | 'occurredAt' | 'change'
> & {
  readonly action: TaskActivityAction;
};

const STARTED_STATUSES: readonly TaskStatus[] = ['progress', 'review', 'done'];
const MINUTES_PER_HOUR = 60;
const STATUS_CHANGE_OFFSET_HOURS = 2;

const taskEvent = (task: SeededTask, step: number, fields: TaskEventFields): ActivityEvent => ({
  ...fields,
  id: `th-${task.id}-${step}`,
  workspaceId: task.workspaceId,
  kind: 'task',
  route: taskRouteOf(task.id),
  category: 'activity',
  entity: { type: 'task', id: task.id },
  teamId: task.teamId,
  meta: null,
  outcome: 'succeeded',
  audit: false,
});

const createdEvent = (task: SeededTask): ActivityEvent =>
  taskEvent(task, 0, {
    actorId: task.reporterId,
    verb: 'created',
    object: `${task.id} · ${task.title}`,
    occurredAt: task.createdAt,
    change: null,
    action: 'task.created',
  });

const movedEvent = (task: SeededTask, index: number): ActivityEvent => {
  const to = TASK_STATUS_LABELS[task.status];
  return taskEvent(task, 1, {
    actorId: task.assigneeId ?? task.reporterId,
    verb: 'moved',
    object: `${task.id} to ${to}`,
    occurredAt: minutesAgo(MINUTES_PER_HOUR * (index + STATUS_CHANGE_OFFSET_HOURS)),
    change: { from: TASK_STATUS_LABELS.todo, to },
    action: 'task.status_changed',
  });
};

const eventsOf = (task: SeededTask, index: number): ActivityEvent[] =>
  STARTED_STATUSES.includes(task.status)
    ? [createdEvent(task), movedEvent(task, index)]
    : [createdEvent(task)];

export const MOCK_TASK_EVENTS: readonly ActivityEvent[] = MOCK_TASKS.flatMap(eventsOf);
