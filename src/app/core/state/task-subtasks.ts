import { Subtask } from '../models/task';

export interface RemovedSubtask {
  readonly subtask: Subtask;
  readonly index: number;
}

export interface SubtaskProgress {
  readonly done: number;
  readonly total: number;
}

export const withSubtaskAdded = (
  subtasks: readonly Subtask[],
  id: string,
  title: string,
): Subtask[] => [...subtasks, { id, title: title.trim(), done: false }];

export const withSubtaskToggled = (subtasks: readonly Subtask[], id: string): Subtask[] =>
  subtasks.map((subtask) => (subtask.id === id ? { ...subtask, done: !subtask.done } : subtask));

export const withSubtaskRenamed = (
  subtasks: readonly Subtask[],
  id: string,
  title: string,
): Subtask[] =>
  subtasks.map((subtask) => (subtask.id === id ? { ...subtask, title: title.trim() } : subtask));

export const withoutSubtask = (subtasks: readonly Subtask[], id: string): Subtask[] =>
  subtasks.filter((subtask) => subtask.id !== id);

export const withSubtaskRestored = (
  subtasks: readonly Subtask[],
  removed: RemovedSubtask,
): Subtask[] => {
  const rest = withoutSubtask(subtasks, removed.subtask.id);
  const index = Math.min(removed.index, rest.length);
  return [...rest.slice(0, index), removed.subtask, ...rest.slice(index)];
};

export const subtaskProgressOf = (subtasks: readonly Subtask[]): SubtaskProgress => ({
  done: subtasks.filter((subtask) => subtask.done).length,
  total: subtasks.length,
});
