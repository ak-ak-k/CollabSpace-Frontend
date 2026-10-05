import { computed, inject, Service } from '@angular/core';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { Team } from '../models/team';
import { ChatState } from './chat.state';
import { TeamChannelAccess, teamUnreadCount, visibleTeamChannels } from './team-channels';
import { WorkspaceState } from './workspace.state';

@Service()
export class TeamChannelsState {
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);

  readonly access = computed<TeamChannelAccess>(() => {
    const conversations = new Map(
      this.chat.conversations().map((conversation) => [conversation.id, conversation]),
    );
    const unreadCounts = this.chat.unreadCounts();
    const archivedIds = this.chat.archivedIds();
    const leftIds = this.chat.leftIds();
    return {
      currentUserId: this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
      memberIdsOf: (channel) => {
        const conversation = conversations.get(channel.id);
        return conversation?.type === 'channel' ? conversation.memberIds : channel.memberIds;
      },
      isArchived: (channelId) => archivedIds.has(channelId),
      hasLeft: (channelId) => leftIds.has(channelId),
      unreadOf: (channelId) => unreadCounts[channelId] ?? 0,
    };
  });

  visibleChannels(team: Team): readonly Channel[] {
    return visibleTeamChannels(team, this.workspace.channels(), this.access());
  }

  unreadCount(team: Team): number {
    return teamUnreadCount(team, this.workspace.channels(), this.access());
  }
}
