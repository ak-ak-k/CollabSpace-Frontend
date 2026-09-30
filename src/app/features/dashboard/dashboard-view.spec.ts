import { Task } from '../../core/models/task';
import { Team } from '../../core/models/team';
import {
  byDueDate,
  overdueTasks,
  tasksDueToday,
  toStats,
  toTeamActivity,
  toUpcomingTask,
} from './dashboard-view';

const DAY = 86_400_000;

const task = (id: string, daysFromToday: number, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  dueAt: new Date().setHours(0, 0, 0, 0) + daysFromToday * DAY,
  labels: [],
  commentCount: 0,
  attachmentCount: 0,
  ...overrides,
});

const team = (id: string, weeklyMessageCount: number): Team => ({
  id,
  name: id,
  code: id.slice(0, 2).toUpperCase(),
  description: '',
  memberIds: [],
  leadId: 'u0',
  channelIds: [],
  activityLevel: 'Active',
  weeklyMessageCount,
  createdLabel: 'Jan 2023',
  joined: true,
  isPrivate: false,
});

describe('dashboard view', () => {
  it('orders tasks by due date and counts overdue and due today separately', () => {
    const views = byDueDate([task('NS-3', 4), task('NS-1', -1), task('NS-2', 0)]).map((item) =>
      toUpcomingTask(item, null),
    );

    expect(views.map((view) => view.id)).toEqual(['NS-1', 'NS-2', 'NS-3']);
    expect(overdueTasks(views)).toBe(1);
    expect(tasksDueToday(views)).toBe(1);
  });

  it('keeps red for urgent tasks only', () => {
    const urgent = toUpcomingTask(task('NS-1', 0, { priority: 'urgent' }), null);
    const high = toUpcomingTask(task('NS-2', 0, { priority: 'high' }), null);

    expect(urgent.priorityTone).toBe('primary');
    expect(high.priorityTone).toBe('outline');
  });

  it('ranks teams by weekly messages without dividing by zero', () => {
    expect(toTeamActivity([team('design', 50), team('frontend', 200)])).toMatchObject([
      { id: 'frontend', share: 100, leading: true },
      { id: 'design', share: 25, leading: false },
    ]);
    expect(toTeamActivity([team('quiet', 0)])[0].share).toBe(0);
    expect(toTeamActivity([])).toEqual([]);
  });

  it('writes singular and plural captions', () => {
    const stats = toStats({
      joinedTeams: [team('frontend', 200)],
      unreadMessages: 1,
      unreadConversations: 1,
      openTasks: [toUpcomingTask(task('NS-1', -2), null)],
      onlineMembers: 3,
      knownMembers: 12,
      workspace: {
        id: 'w1',
        name: 'Northstar Labs',
        code: 'NL',
        memberCount: 48,
        plan: 'Business',
      },
    });

    expect(stats.map((stat) => stat.caption)).toEqual([
      'frontend is the most active',
      'Across 1 conversation',
      '1 overdue · 0 due today',
      'of 12 in Northstar Labs',
    ]);
    expect(stats[2].tone).toBe('danger');
  });
});
