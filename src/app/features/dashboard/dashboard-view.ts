import { ActivityEvent, activityIconOf } from '../../core/models/activity';
import { Task, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../core/models/task';
import { Team } from '../../core/models/team';
import { firstNameOf, User, userColorSeed } from '../../core/models/user';
import { Workspace } from '../../core/models/workspace';
import { DueLabel, dueLabelOf, formatRelative } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { PRIORITY_TAG_TONES, TagTone } from '../../shared/ui/tag/tag.component';
import { DashboardStat } from './stat-card/stat-card.component';

export interface PersonView {
  readonly name: string;
  readonly firstName: string;
  readonly seed: number;
}

export interface UpcomingTaskView {
  readonly id: string;
  readonly title: string;
  readonly priorityLabel: string;
  readonly priorityTone: TagTone;
  readonly statusLabel: string;
  readonly due: DueLabel;
  readonly assignee: PersonView | null;
}

export interface TeamActivityView {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly messageCount: number;
  readonly share: number;
  readonly leading: boolean;
}

export interface ActivityView {
  readonly id: string;
  readonly actor: PersonView;
  readonly verb: string;
  readonly object: string;
  readonly icon: IconName;
  readonly when: string;
  readonly route: string;
}

export interface StatInputs {
  readonly joinedTeams: readonly Team[];
  readonly unreadMessages: number;
  readonly unreadConversations: number;
  readonly openTasks: readonly UpcomingTaskView[];
  readonly onlineMembers: number;
  readonly knownMembers: number;
  readonly workspace: Workspace | null;
  readonly dataEmpty: boolean;
}

const UPCOMING_TASK_LIMIT = 5;
const ACTIVITY_LIMIT = 6;
const FULL_SHARE = 100;
const UNKNOWN_PERSON: PersonView = { name: 'Someone', firstName: 'Someone', seed: 0 };

const plural = (count: number, singular: string): string =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

export const personViewOf = (user: User | null): PersonView | null =>
  user
    ? { name: user.name, firstName: firstNameOf(user.name), seed: userColorSeed(user.id) }
    : null;

export const toUpcomingTask = (task: Task, assignee: User | null): UpcomingTaskView => ({
  id: task.id,
  title: task.title,
  priorityLabel: TASK_PRIORITY_LABELS[task.priority],
  priorityTone: PRIORITY_TAG_TONES[task.priority],
  statusLabel: TASK_STATUS_LABELS[task.status],
  due: dueLabelOf(task.dueAt),
  assignee: personViewOf(assignee),
});

export const byDueDate = (tasks: readonly Task[]): Task[] =>
  [...tasks].sort((first, second) => first.dueAt - second.dueAt);

export const upcomingTasks = (tasks: readonly UpcomingTaskView[]): UpcomingTaskView[] =>
  tasks.slice(0, UPCOMING_TASK_LIMIT);

export const tasksDueToday = (tasks: readonly UpcomingTaskView[]): number =>
  tasks.filter((task) => task.due.daysFromToday === 0).length;

export const overdueTasks = (tasks: readonly UpcomingTaskView[]): number =>
  tasks.filter((task) => task.due.overdue).length;

export const toTeamActivity = (teams: readonly Team[]): TeamActivityView[] => {
  const ranked = [...teams].sort(
    (first, second) => second.weeklyMessageCount - first.weeklyMessageCount,
  );
  const highest = ranked[0]?.weeklyMessageCount ?? 0;
  return ranked.map((team, index) => ({
    id: team.id,
    name: team.name,
    code: team.code,
    messageCount: team.weeklyMessageCount,
    share: highest > 0 ? Math.round((team.weeklyMessageCount / highest) * FULL_SHARE) : 0,
    leading: index === 0,
  }));
};

export const toActivity = (
  events: readonly ActivityEvent[],
  userOf: (userId: string) => User | null,
): ActivityView[] =>
  events.slice(0, ACTIVITY_LIMIT).map((event) => ({
    id: event.id,
    actor: personViewOf(userOf(event.actorId)) ?? UNKNOWN_PERSON,
    verb: event.verb,
    object: event.object,
    icon: activityIconOf(event.kind),
    when: formatRelative(event.occurredAt),
    route: event.route,
  }));

const busiestTeamCaption = (teams: readonly Team[], dataEmpty: boolean): string => {
  const busiest = toTeamActivity(teams)[0];
  if (dataEmpty) {
    return 'Create your first team';
  }
  return busiest ? `${busiest.name} is the most active` : 'No teams yet';
};

const openTasksCaption = (tasks: readonly UpcomingTaskView[], dataEmpty: boolean): string => {
  if (dataEmpty) {
    return 'Board is empty';
  }
  const dueToday = `${tasksDueToday(tasks)} due today`;
  const overdue = overdueTasks(tasks);
  return overdue > 0 ? `${overdue} overdue · ${dueToday}` : dueToday;
};

export const toStats = (inputs: StatInputs): DashboardStat[] => [
  {
    id: 'teams',
    label: 'Active teams',
    icon: 'users',
    value: inputs.joinedTeams.length,
    caption: busiestTeamCaption(inputs.joinedTeams, inputs.dataEmpty),
    link: '/teams',
    tone: 'default',
  },
  {
    id: 'messages',
    label: 'Unread messages',
    icon: 'message-square',
    value: inputs.unreadMessages,
    caption: inputs.dataEmpty
      ? 'No messages yet'
      : `Across ${plural(inputs.unreadConversations, 'conversation')}`,
    link: '/messages',
    tone: 'default',
  },
  {
    id: 'tasks',
    label: 'Open tasks',
    icon: 'square-kanban',
    value: inputs.openTasks.length,
    caption: openTasksCaption(inputs.openTasks, inputs.dataEmpty),
    link: '/tasks',
    tone: overdueTasks(inputs.openTasks) > 0 ? 'danger' : 'default',
  },
  {
    id: 'members',
    label: 'Online members',
    icon: 'activity',
    value: inputs.onlineMembers,
    caption: inputs.workspace ? `of ${inputs.knownMembers} in ${inputs.workspace.name}` : '',
    link: '/workspace/members/online',
    tone: 'default',
  },
];
