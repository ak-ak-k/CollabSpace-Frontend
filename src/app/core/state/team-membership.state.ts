import { computed, inject, Service } from '@angular/core';
import { TeamsData } from '../data/teams.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { AssignableTeamRole, Team, TeamChanges, TeamRole } from '../models/team';
import {
  canManageTeam,
  channelWithMembers,
  channelWithoutMember,
  teamRoleOf,
  withoutTeamMember,
  withTeamMembers,
  withTeamRole,
} from '../models/team-rules';
import { ChatMembershipState } from './chat-membership.state';
import { WorkspaceState } from './workspace.state';

@Service()
export class TeamMembershipState {
  private readonly workspace = inject(WorkspaceState);
  private readonly teamsData = inject(TeamsData);
  private readonly chatMembership = inject(ChatMembershipState);

  private readonly currentUserId = computed(
    () => this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
  );

  roleOf(teamId: string, userId: string): TeamRole {
    const team = this.workspace.team(teamId);
    return team ? teamRoleOf(team, userId) : 'member';
  }

  canManageTeam(teamId: string): boolean {
    const team = this.workspace.team(teamId);
    return !!team && canManageTeam(team, this.currentUserId(), this.workspace.access().canManage);
  }

  async addToTeam(teamId: string, userIds: readonly string[]): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team || userIds.length === 0) {
      return;
    }
    const channels = this.applyMembership(
      withTeamMembers(team, userIds, this.currentUserId()),
      (channel) => channelWithMembers(channel, userIds),
    );
    await Promise.all([
      this.teamsData.addMembers(teamId, userIds),
      ...channels
        .filter((channel) => !channel.isPrivate)
        .map((channel) => this.chatMembership.addToGroup(channel.id, userIds)),
    ]);
  }

  async removeFromTeam(teamId: string, userId: string): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team?.memberIds.includes(userId)) {
      return;
    }
    const channels = this.applyMembership(
      withoutTeamMember(team, userId, this.currentUserId()),
      (channel) => channelWithoutMember(channel, userId),
    );
    await Promise.all([
      this.teamsData.removeMember(teamId, userId),
      ...channels.map((channel) => this.chatMembership.removeFromGroup(channel.id, userId)),
    ]);
  }

  async setTeamRole(teamId: string, userId: string, role: AssignableTeamRole): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team || teamRoleOf(team, userId) === 'owner') {
      return;
    }
    this.workspace.putTeam(withTeamRole(team, userId, role));
    await this.teamsData.setRole(teamId, userId, role);
  }

  async updateTeam(teamId: string, changes: TeamChanges): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team) {
      return;
    }
    this.workspace.putTeam({ ...team, ...changes });
    await this.teamsData.updateTeam(teamId, changes);
  }

  async setArchived(teamId: string, archived: boolean): Promise<void> {
    const team = this.workspace.anyTeam(teamId);
    if (!team) {
      return;
    }
    this.workspace.putTeam({ ...team, archived });
    await this.teamsData.setArchived(teamId, archived);
  }

  private applyMembership(team: Team, change: (channel: Channel) => Channel): readonly Channel[] {
    const channels = this.workspace
      .channels()
      .filter((channel) => team.channelIds.includes(channel.id))
      .map(change);
    this.workspace.putTeam(team);
    this.workspace.putChannels(channels);
    return channels;
  }
}
