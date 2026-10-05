import {
  Task,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskChanges,
  TaskStatus,
} from '../models/task';

export interface TaskNoteLookup {
  readonly userName: (userId: string) => string | null;
  readonly teamName: (teamId: string) => string | null;
}

export const CREATED_NOTE = 'created this task';

export const statusNote = (from: TaskStatus, to: TaskStatus): string =>
  `changed status: ${TASK_STATUS_LABELS[from]} → ${TASK_STATUS_LABELS[to]}`;

const assigneeNote = (assigneeId: string | null, lookup: TaskNoteLookup): string =>
  assigneeId ? `assigned ${lookup.userName(assigneeId) ?? 'nobody'}` : 'removed the assignee';

const teamNote = (teamId: string | null, lookup: TaskNoteLookup): string =>
  teamId ? `moved it to ${lookup.teamName(teamId) ?? 'a team'}` : 'removed the team';

const changed = <Key extends keyof TaskChanges>(
  task: Task,
  changes: TaskChanges,
  key: Key,
): boolean => changes[key] !== undefined && changes[key] !== task[key];

export const taskChangeNote = (
  task: Task,
  changes: TaskChanges,
  lookup: TaskNoteLookup,
): string | null => {
  if (changes.status && changed(task, changes, 'status')) {
    return statusNote(task.status, changes.status);
  }
  if (changes.priority && changed(task, changes, 'priority')) {
    return `changed priority: ${TASK_PRIORITY_LABELS[task.priority]} → ${TASK_PRIORITY_LABELS[changes.priority]}`;
  }
  if (changes.assigneeId !== undefined && changed(task, changes, 'assigneeId')) {
    return assigneeNote(changes.assigneeId, lookup);
  }
  if (changed(task, changes, 'dueAt')) {
    return 'changed the due date';
  }
  if (changes.teamId !== undefined && changed(task, changes, 'teamId')) {
    return teamNote(changes.teamId, lookup);
  }
  return changes.title && changed(task, changes, 'title') ? 'renamed the task' : null;
};
