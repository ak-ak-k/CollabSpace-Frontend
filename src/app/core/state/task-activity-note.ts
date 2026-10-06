import { ActivityChange, ActivityEntry } from '../models/activity';
import {
  Task,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskChanges,
  taskRouteOf,
  TaskStatus,
} from '../models/task';

export interface TaskNote {
  readonly verb: string;
  readonly object: string;
  readonly change?: ActivityChange;
}

export interface TaskNoteLookup {
  readonly userName: (userId: string) => string | null;
  readonly teamName: (teamId: string) => string | null;
}

const NO_TEAM = 'no team';
const UNKNOWN_ASSIGNEE = 'nobody';

const titledObject = (task: Task): string => `${task.id} · ${task.title}`;

export const createdNote = (task: Task): TaskNote => ({
  verb: 'created',
  object: titledObject(task),
});

export const deletedNote = (task: Task): TaskNote => ({
  verb: 'deleted',
  object: titledObject(task),
});

export const commentedNote = (task: Task): TaskNote => ({ verb: 'commented on', object: task.id });

export const statusNote = (task: Task, to: TaskStatus): TaskNote => {
  const change = { from: TASK_STATUS_LABELS[task.status], to: TASK_STATUS_LABELS[to] };
  return to === 'done'
    ? { verb: 'completed', object: task.id, change }
    : { verb: 'moved', object: `${task.id} to ${change.to}`, change };
};

const assigneeNote = (task: Task, assigneeId: string | null, lookup: TaskNoteLookup): TaskNote =>
  assigneeId
    ? { verb: `assigned ${lookup.userName(assigneeId) ?? UNKNOWN_ASSIGNEE} to`, object: task.id }
    : { verb: 'unassigned', object: task.id };

const teamNote = (task: Task, teamId: string | null, lookup: TaskNoteLookup): TaskNote => ({
  verb: 'moved',
  object: `${task.id} to ${(teamId && lookup.teamName(teamId)) || NO_TEAM}`,
});

const changed = <Key extends keyof TaskChanges>(
  task: Task,
  changes: TaskChanges,
  key: Key,
): boolean => changes[key] !== undefined && changes[key] !== task[key];

export const taskChangeNote = (
  task: Task,
  changes: TaskChanges,
  lookup: TaskNoteLookup,
): TaskNote | null => {
  if (changes.status && changed(task, changes, 'status')) {
    return statusNote(task, changes.status);
  }
  if (changes.priority && changed(task, changes, 'priority')) {
    const change = {
      from: TASK_PRIORITY_LABELS[task.priority],
      to: TASK_PRIORITY_LABELS[changes.priority],
    };
    return { verb: 'changed the priority of', object: task.id, change };
  }
  if (changes.assigneeId !== undefined && changed(task, changes, 'assigneeId')) {
    return assigneeNote(task, changes.assigneeId, lookup);
  }
  if (changed(task, changes, 'dueAt')) {
    return { verb: 'changed the due date of', object: task.id };
  }
  if (changes.teamId !== undefined && changed(task, changes, 'teamId')) {
    return teamNote(task, changes.teamId, lookup);
  }
  return changes.title && changed(task, changes, 'title')
    ? { verb: 'renamed', object: task.id }
    : null;
};

export const taskActivityEntry = (task: Task, note: TaskNote): ActivityEntry => ({
  kind: 'task',
  verb: note.verb,
  object: note.object,
  route: taskRouteOf(task.id),
  category: 'activity',
  entity: { type: 'task', id: task.id },
  teamId: task.teamId,
  change: note.change ?? null,
});
