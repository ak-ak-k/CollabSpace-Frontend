import { Channel } from '../models/channel';
import { Team } from '../models/team';

export interface TeamChannelAccess {
  readonly currentUserId: string;
  readonly memberIdsOf: (channel: Channel) => readonly string[];
  readonly isArchived: (channelId: string) => boolean;
  readonly hasLeft: (channelId: string) => boolean;
  readonly unreadOf: (channelId: string) => number;
}

export const canSeeTeamChannel = (channel: Channel, access: TeamChannelAccess): boolean =>
  !access.isArchived(channel.id) &&
  (!channel.isPrivate || access.memberIdsOf(channel).includes(access.currentUserId));

export const visibleTeamChannels = (
  team: Pick<Team, 'channelIds'>,
  channels: readonly Channel[],
  access: TeamChannelAccess,
): readonly Channel[] => {
  const byId = new Map(channels.map((channel) => [channel.id, channel]));
  return team.channelIds
    .map((channelId) => byId.get(channelId))
    .filter((channel) => channel !== undefined)
    .filter((channel) => canSeeTeamChannel(channel, access));
};

export const teamUnreadCount = (
  team: Pick<Team, 'channelIds'>,
  channels: readonly Channel[],
  access: TeamChannelAccess,
): number =>
  visibleTeamChannels(team, channels, access)
    .filter((channel) => !access.hasLeft(channel.id))
    .reduce((total, channel) => total + access.unreadOf(channel.id), 0);
