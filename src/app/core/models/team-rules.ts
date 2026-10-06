import { Channel } from './channel';
import { AssignableTeamRole, Team, TeamRole } from './team';

export const teamRoleOf = (team: Pick<Team, 'ownerId' | 'adminIds'>, userId: string): TeamRole => {
  if (userId === team.ownerId) {
    return 'owner';
  }
  return team.adminIds.includes(userId) ? 'admin' : 'member';
};

export const withTeamMembers = (
  team: Team,
  userIds: readonly string[],
  currentUserId: string,
): Team => ({
  ...team,
  memberIds: [...new Set([...team.memberIds, ...userIds])],
  joined: team.joined || userIds.includes(currentUserId),
});

export const withoutTeamMember = (team: Team, userId: string, currentUserId: string): Team => ({
  ...team,
  memberIds: team.memberIds.filter((memberId) => memberId !== userId),
  adminIds: team.adminIds.filter((adminId) => adminId !== userId),
  joined: team.joined && userId !== currentUserId,
});

export const withTeamRole = (team: Team, userId: string, role: AssignableTeamRole): Team => {
  const adminIds = team.adminIds.filter((adminId) => adminId !== userId);
  return { ...team, adminIds: role === 'admin' ? [...adminIds, userId] : adminIds };
};

export const channelWithMembers = (channel: Channel, userIds: readonly string[]): Channel =>
  channel.isPrivate
    ? channel
    : { ...channel, memberIds: [...new Set([...channel.memberIds, ...userIds])] };

export const channelWithoutMember = (channel: Channel, userId: string): Channel => ({
  ...channel,
  memberIds: channel.memberIds.filter((memberId) => memberId !== userId),
});
