import { Task } from '../models/task';
import { dueReminderIdOf, dueRemindersFor } from './due-reminders';

const NOW = new Date(2026, 9, 5, 10, 0).getTime();
const DAY = 86_400_000;

const task = (id: string, dueInDays: number, changes: Partial<Task> = {}): Task => ({
  workspaceId: 'w1',
  id,
  title: `Task ${id}`,
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: 'u0',
  dueAt: NOW + dueInDays * DAY,
  labels: [],
  teamId: null,
  subtasks: [],
  reporterId: 'u4',
  createdAt: NOW,
  updatedAt: NOW,
  pending: false,
  ...changes,
});

const context = { currentUserId: 'u0', now: NOW, knownIds: new Set<string>() };

describe('dueRemindersFor', () => {
  it('reminds me about my tasks due today, tomorrow or overdue', () => {
    const reminders = dueRemindersFor(
      [task('NS-1', -1), task('NS-2', 0), task('NS-3', 1), task('NS-4', 3)],
      context,
    );

    expect(reminders.map((reminder) => reminder.text)).toEqual([
      'NS-1 is 1 day overdue',
      'NS-2 is due today',
      'NS-3 is due tomorrow',
    ]);
    expect(reminders[0]).toEqual(
      expect.objectContaining({
        category: 'task',
        icon: 'circle-alert',
        route: '/tasks?task=NS-1',
      }),
    );
    expect(reminders[1].icon).toBe('calendar');
  });

  it('skips other people’s tasks, finished tasks and reminders already sent today', () => {
    const reminders = dueRemindersFor(
      [task('NS-5', 0, { assigneeId: 'u2' }), task('NS-6', 0, { status: 'done' }), task('NS-7', 0)],
      { ...context, knownIds: new Set([dueReminderIdOf('NS-7', NOW)]) },
    );

    expect(reminders).toEqual([]);
  });

  it('gives each task one reminder id per day', () => {
    expect(dueReminderIdOf('NS-7', NOW)).toBe('due-NS-7-2026-10-05');
    expect(dueReminderIdOf('NS-7', NOW + DAY)).toBe('due-NS-7-2026-10-06');
  });
});
