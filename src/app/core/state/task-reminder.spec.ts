import { MOCK_TASKS } from '../mocks/tasks.mock';
import { dueReminderOf, Task } from '../models/task';

const DAY = 86_400_000;
const now = new Date(2026, 9, 5, 10, 30).getTime();
const today = new Date(2026, 9, 5).getTime();

const dueIn = (days: number, changes: Partial<Task> = {}): Task => ({
  ...MOCK_TASKS[0],
  id: 'NS-200',
  status: 'todo',
  dueAt: today + days * DAY,
  ...changes,
});

describe('dueReminderOf', () => {
  it('reminds about tasks due today or tomorrow', () => {
    expect(dueReminderOf(dueIn(0), now)).toBe('NS-200 is due today');
    expect(dueReminderOf(dueIn(1), now)).toBe('NS-200 is due tomorrow');
  });

  it('counts overdue days', () => {
    expect(dueReminderOf(dueIn(-1), now)).toBe('NS-200 is 1 day overdue');
    expect(dueReminderOf(dueIn(-4), now)).toBe('NS-200 is 4 days overdue');
  });

  it('stays quiet for later or finished tasks', () => {
    expect(dueReminderOf(dueIn(2), now)).toBeNull();
    expect(dueReminderOf(dueIn(-2, { status: 'done' }), now)).toBeNull();
  });
});
