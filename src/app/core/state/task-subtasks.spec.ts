import { Subtask } from '../models/task';
import {
  subtaskProgressOf,
  withoutSubtask,
  withSubtaskAdded,
  withSubtaskRenamed,
  withSubtaskRestored,
  withSubtaskToggled,
} from './task-subtasks';

const subtasks: readonly Subtask[] = [
  { id: 'a', title: 'Split input', done: true },
  { id: 'b', title: 'Fix Safari', done: false },
  { id: 'c', title: 'Add tests', done: false },
];

describe('task subtasks', () => {
  it('adds, toggles and renames subtasks', () => {
    const added = withSubtaskAdded(subtasks, 'd', '  Write docs ');
    expect(added.at(-1)).toEqual({ id: 'd', title: 'Write docs', done: false });

    expect(withSubtaskToggled(subtasks, 'b')[1]?.done).toBe(true);
    expect(withSubtaskRenamed(subtasks, 'c', 'Add e2e tests')[2]?.title).toBe('Add e2e tests');
  });

  it('restores a removed subtask at its old position', () => {
    const removed = { subtask: subtasks[1], index: 1 };
    const without = withoutSubtask(subtasks, 'b');

    expect(without.map(({ id }) => id)).toEqual(['a', 'c']);
    expect(withSubtaskRestored(without, removed).map(({ id }) => id)).toEqual(['a', 'b', 'c']);
  });

  it('counts finished subtasks', () => {
    expect(subtaskProgressOf(subtasks)).toEqual({ done: 1, total: 3 });
    expect(subtaskProgressOf([])).toEqual({ done: 0, total: 0 });
  });
});
