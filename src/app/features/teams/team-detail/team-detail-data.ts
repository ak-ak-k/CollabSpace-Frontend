import { computed, inject, Signal } from '@angular/core';
import { Team } from '../../../core/models/team';
import { ChatState } from '../../../core/state/chat.state';
import { FileState } from '../../../core/state/file.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import {
  channelRowView,
  ChannelRowView,
  teamActivityItem,
  TeamActivityItem,
  teamFileLocations,
  teamFileView,
  TeamFileView,
  teamMemberView,
  TeamMemberView,
} from '../team-view';

export interface TeamStat {
  readonly label: string;
  readonly value: number;
}

export interface TeamDetailData {
  readonly team: Signal<Team | null>;
  readonly channels: Signal<readonly ChannelRowView[]>;
  readonly members: Signal<readonly TeamMemberView[]>;
  readonly files: Signal<readonly TeamFileView[]>;
  readonly activity: Signal<readonly TeamActivityItem[]>;
  readonly lead: Signal<TeamMemberView | null>;
  readonly stats: Signal<readonly TeamStat[]>;
}

export const injectTeamDetail = (teamId: () => string): TeamDetailData => {
  const workspace = inject(WorkspaceState);
  const chat = inject(ChatState);
  const fileState = inject(FileState);
  const currentUserId = computed(() => workspace.currentUser()?.id ?? '');
  const team = computed(() => workspace.team(teamId()));

  const channels = computed(() => {
    const current = team();
    if (!current) {
      return [];
    }
    return current.channelIds
      .map((channelId) => workspace.channels().find((channel) => channel.id === channelId))
      .filter((channel) => channel !== undefined)
      .map((channel) =>
        channelRowView(
          channel,
          chat.messages()[channel.id] ?? [],
          chat.unreadCounts()[channel.id] ?? 0,
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
      .filesAt(teamFileLocations(current, workspace.channels()))
      .map((file) => teamFileView(file, workspace.usersById(), currentUserId()));
  });

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
    { label: 'Channels', value: team()?.channelIds.length ?? 0 },
    { label: 'Files', value: files().length },
    { label: 'This week', value: team()?.weeklyMessageCount ?? 0 },
  ]);

  return { team, channels, members, files, activity, lead, stats };
};
