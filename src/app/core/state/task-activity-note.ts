import { formatDate } from '../../shared/pipes/time-format';
import { ActivityChange, ActivityEntry } from '../models/activity';
import { TaskActivityAction } from '../models/activity-action';
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
  readonly action: TaskActivityAction;
  readonly change?: ActivityChange;
}

export interface TaskNoteLookup {
  readonly userName: (userId: string) => string | null;
  readonly userFullName: (userId: string) => string | null;
  readonly teamName: (teamId: string) => string | null;
}

const NO_TEAM = 'no team';
const NO_TEAM_LABEL = 'No team';
const NO_DATE = 'No date';
const UNASSIGNED = 'Unassigned';
const UNKNOWN_ASSIGNEE = 'nobody';
const DUE_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

const titledObject = (task: Task): string => `${task.id} · ${task.title}`;

export const createdNote = (task: Task): TaskNote => ({
  verb: 'created',
  object: titledObject(task),
  action: 'task.created',
});

export const deletedNote = (task: Task): TaskNote => ({
  verb: 'deleted',
  object: titledObject(task),
  action: 'task.deleted',
});

export const restoredNote = (task: Task): TaskNote => ({
  verb: 'restored',
  object: titledObject(task),
  action: 'task.restored',
});

export const commentedNote = (task: Task): TaskNote => ({
  verb: 'commented on',
  object: task.id,
  action: 'task.commented',
});

export const statusNote = (task: Task, to: TaskStatus): TaskNote => {
  const change = { from: TASK_STATUS_LABELS[task.status], to: TASK_STATUS_LABELS[to] };
  if (to === 'done') {
    return { verb: 'completed', object: task.id, action: 'task.completed', change };
  }
  if (task.status === 'done') {
    return { verb: 'reopened', object: task.id, action: 'task.reopened', change };
  }
  return {
    verb: 'moved',
    object: `${task.id} to ${change.to}`,
    action: 'task.status_changed',
    change,
  };
};

const fullNameOf = (userId: string | null, lookup: TaskNoteLookup): string =>
  (userId && lookup.userFullName(userId)) || UNASSIGNED;

const assigneeNote = (task: Task, assigneeId: string | null, lookup: TaskNoteLookup): TaskNote => {
  const change = {
    from: fullNameOf(task.assigneeId, lookup),
    to: fullNameOf(assigneeId, lookup),
  };
  if (!assigneeId) {
    return { verb: 'unassigned', object: task.id, action: 'task.unassigned', change };
  }
  const name = lookup.userName(assigneeId) ?? UNKNOWN_ASSIGNEE;
  return task.assigneeId
    ? { verb: 'reassigned', object: `${task.id} to ${name}`, action: 'task.reassigned', change }
    : { verb: `assigned ${name} to`, object: task.id, action: 'task.assigned', change };
};

const teamLabelOf = (teamId: string | null, lookup: TaskNoteLookup): string =>
  (teamId && lookup.teamName(teamId)) || NO_TEAM_LABEL;

const teamNote = (task: Task, teamId: string | null, lookup: TaskNoteLookup): TaskNote => ({
  verb: 'moved',
  object: `${task.id} to ${teamId ? teamLabelOf(teamId, lookup) : NO_TEAM}`,
  action: 'task.team_changed',
  change: { from: teamLabelOf(task.teamId, lookup), to: teamLabelOf(teamId, lookup) },
});

export const dueDateLabel = (timestamp: number | null): string =>
  timestamp ? formatDate(timestamp, DUE_DATE_FORMAT) : NO_DATE;

const dueNote = (task: Task, dueAt: number | null): TaskNote => ({
  verb: 'changed the due date of',
  object: task.id,
  action: 'task.due_changed',
  change: { from: dueDateLabel(task.dueAt), to: dueDateLabel(dueAt) },
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
    return {
      verb: 'changed the priority of',
      object: task.id,
      action: 'task.priority_changed',
      change,
    };
  }
  if (changes.assigneeId !== undefined && changed(task, changes, 'assigneeId')) {
    return assigneeNote(task, changes.assigneeId, lookup);
  }
  if (changes.dueAt !== undefined && changed(task, changes, 'dueAt')) {
    return dueNote(task, changes.dueAt);
  }
  if (changes.teamId !== undefined && changed(task, changes, 'teamId')) {
    return teamNote(task, changes.teamId, lookup);
  }
  return changes.title && changed(task, changes, 'title')
    ? {
        verb: 'renamed',
        object: task.id,
        action: 'task.renamed',
        change: { from: task.title, to: changes.title },
      }
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
  action: note.action,
});
