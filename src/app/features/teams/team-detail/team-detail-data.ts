import { computed, inject, Signal } from '@angular/core';
import { Team } from '../../../core/models/team';
import { ChatState } from '../../../core/state/chat.state';
import { FileState } from '../../../core/state/file.state';
import { TeamChannelsState } from '../../../core/state/team-channels.state';
import { TaskState } from '../../../core/state/task.state';
import { TeamMembershipState } from '../../../core/state/team-membership.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { teamMemberView, TeamMemberView } from '../team-member-view';
import { teamTaskView, TeamTaskView } from '../team-task-view';
import {
  channelRowView,
  ChannelRowView,
  isTeamFile,
  teamActivityItem,
  TeamActivityItem,
  teamFileView,
  TeamFileView,
} from '../team-view';

export interface TeamStat {
  readonly label: string;
  readonly value: number;
}

export interface TeamDetailData {
  readonly team: Signal<Team | null>;
  readonly canManage: Signal<boolean>;
  readonly channels: Signal<readonly ChannelRowView[]>;
  readonly members: Signal<readonly TeamMemberView[]>;
  readonly files: Signal<readonly TeamFileView[]>;
  readonly tasks: Signal<readonly TeamTaskView[]>;
  readonly activity: Signal<readonly TeamActivityItem[]>;
  readonly lead: Signal<TeamMemberView | null>;
  readonly stats: Signal<readonly TeamStat[]>;
}

export const injectTeamDetail = (teamId: () => string): TeamDetailData => {
  const workspace = inject(WorkspaceState);
  const chat = inject(ChatState);
  const fileState = inject(FileState);
  const teamChannels = inject(TeamChannelsState);
  const membership = inject(TeamMembershipState);
  const taskState = inject(TaskState);
  const currentUserId = computed(() => workspace.currentUser()?.id ?? '');
  const team = computed(() => workspace.team(teamId()));
  const canManage = computed(() => !!team() && membership.canManageTeam(teamId()));

  const channels = computed(() => {
    const current = team();
    if (!current) {
      return [];
    }
    return teamChannels
      .visibleChannels(current)
      .map((channel) =>
        channelRowView(
          channel,
          chat.timeline(channel.id),
          teamChannels.access().unreadOf(channel.id),
          workspace.usersById(),
        ),
      );
  });

  const members = computed(() => {
    const current = team();
    if (!current) {
      return [];
    }
    return current.memberIds
      .map((memberId) => workspace.user(memberId))
      .filter((user) => user !== null)
      .map((user) => teamMemberView(user, current, currentUserId()));
  });

  const files = computed(() => {
    const current = team();
    if (!current) {
      return [];
    }
    return fileState
      .files()
      .filter((file) => isTeamFile(file, current))
      .map((file) => teamFileView(file, workspace.usersById(), currentUserId()));
  });

  const tasks = computed(() =>
    taskState
      .tasksForTeam(teamId())
      .map((task) => teamTaskView(task, workspace.user(task.assigneeId))),
  );

  const activity = computed(() =>
    workspace
      .activity()
      .filter((event) => event.teamId === teamId())
      .sort((first, second) => second.occurredAt - first.occurredAt)
      .map((event) => teamActivityItem(event, workspace.usersById())),
  );

  const lead = computed(() => members().find((member) => member.id === team()?.leadId) ?? null);

  const stats = computed<readonly TeamStat[]>(() => [
    { label: 'Members', value: team()?.memberIds.length ?? 0 },
    { label: 'Channels', value: channels().length },
    { label: 'Files', value: files().length },
    { label: 'This week', value: team()?.weeklyMessageCount ?? 0 },
  ]);

  return { team, canManage, channels, members, files, tasks, activity, lead, stats };
};
