import { MOCK_TASKS } from '../mocks/tasks.mock';
import { reorder } from './tasks.data';

describe('reorder', () => {
  it('inserts before a given task', () => {
    const moved = reorder(MOCK_TASKS, 'NS-160', 'todo', 'NS-149');
    const todo = moved.filter((task) => task.status === 'todo').map((task) => task.id);

    expect(todo).toEqual(['NS-151', 'NS-160', 'NS-149', 'NS-153']);
  });

  it('appends to the end of the column without a target', () => {
    const moved = reorder(MOCK_TASKS, 'NS-160', 'done');
    const done = moved.filter((task) => task.status === 'done').map((task) => task.id);

    expect(done.at(-1)).toBe('NS-160');
  });

  it('leaves the list unchanged for an unknown task', () => {
    expect(reorder(MOCK_TASKS, 'NS-999', 'done')).toEqual([...MOCK_TASKS]);
  });
});
