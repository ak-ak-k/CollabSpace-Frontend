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
  workspaceId: 'w1',
  title: `Task ${id}`,
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  dueAt: new Date().setHours(0, 0, 0, 0) + daysFromToday * DAY,
  labels: [],
  teamId: null,
  subtasks: [],
  reporterId: 'u0',
  createdAt: 0,
  updatedAt: 0,
  pending: false,
  ...overrides,
});

const team = (id: string, weeklyMessageCount: number): Team => ({
  id,
  workspaceId: 'w1',
  name: id,
  code: id.slice(0, 2).toUpperCase(),
  description: '',
  memberIds: [],
  leadId: 'u0',
  ownerId: 'u0',
  adminIds: [],
  channelIds: [],
  activityLevel: 'Active',
  weeklyMessageCount,
  createdLabel: 'Jan 2023',
  joined: true,
  isPrivate: false,
  archived: false,
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
      workspaceTeams: [team('frontend', 200), team('design', 400)],
      unreadMessages: 1,
      unreadConversations: 1,
      openTasks: [toUpcomingTask(task('NS-1', -2), null)],
      onlineMembers: 3,
      knownMembers: 12,
      workspace: {
        id: 'w1',
        name: 'Northstar Labs',
        code: 'NL',
        plan: 'Business',
        slug: 'northstar-labs',
        description: '',
        createdLabel: 'Mar 2022',
        ownerId: 'u0',
        domain: 'northstar.io',
        logoUrl: null,
        archivedAt: null,
        deleteAt: null,
      },
      dataEmpty: false,
    });

    expect(stats.map((stat) => stat.caption)).toEqual([
      'design is the most active',
      'Across 1 conversation',
      '1 overdue · 0 due today',
      'of 12 in Northstar Labs',
    ]);
    expect(stats[2].tone).toBe('danger');
  });

  it('describes an empty workspace differently from missing data', () => {
    const inputs = {
      joinedTeams: [],
      workspaceTeams: [],
      unreadMessages: 0,
      unreadConversations: 0,
      openTasks: [],
      onlineMembers: 0,
      knownMembers: 1,
      workspace: null,
    };

    expect(toStats({ ...inputs, dataEmpty: false }).map((stat) => stat.caption)).toEqual([
      'No teams yet',
      'Across 0 conversations',
      '0 due today',
      '',
    ]);
    expect(toStats({ ...inputs, dataEmpty: true }).map((stat) => stat.caption)).toEqual([
      'Create your first team',
      'No messages yet',
      'Board is empty',
      '',
    ]);
  });
});
