import { computed, inject, Service } from '@angular/core';
import { TeamsData } from '../data/teams.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { AssignableTeamRole, Team, TeamChanges, TeamRole } from '../models/team';
import {
  channelWithMembers,
  channelWithoutMember,
  teamRoleOf,
  withoutTeamMember,
  withTeamMembers,
  withTeamRole,
} from '../models/team-rules';
import { ActivityLogState } from './activity-log.state';
import { ChatMembershipState } from './chat-membership.state';
import {
  teamArchiveEntry,
  teamMemberRemovedEntry,
  teamMembersAddedEntry,
  teamMembershipEntry,
  teamRoleEntry,
  teamUpdateEntries,
} from './team-activity';
import { WorkspaceState } from './workspace.state';

const UNKNOWN_PERSON = 'Someone';

@Service()
export class TeamMembershipState {
  private readonly workspace = inject(WorkspaceState);
  private readonly teamsData = inject(TeamsData);
  private readonly chatMembership = inject(ChatMembershipState);
  private readonly activity = inject(ActivityLogState);

  private readonly currentUserId = computed(
    () => this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
  );

  roleOf(teamId: string, userId: string): TeamRole {
    const team = this.workspace.team(teamId);
    return team ? teamRoleOf(team, userId) : 'member';
  }

  canManageTeam(teamId: string): boolean {
    const team = this.workspace.team(teamId);
    return !!team && this.workspace.can('teams.manage', { team });
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
    const names = userIds.map((userId) => this.nameOf(userId));
    this.activity.record(teamMembersAddedEntry(team, names));
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
    this.activity.record(teamMemberRemovedEntry(team, this.nameOf(userId)));
    await Promise.all([
      this.teamsData.removeMember(teamId, userId),
      ...channels.map((channel) => this.chatMembership.removeFromGroup(channel.id, userId)),
    ]);
  }

  async setTeamRole(teamId: string, userId: string, role: AssignableTeamRole): Promise<void> {
    const team = this.workspace.team(teamId);
    const previous = team ? teamRoleOf(team, userId) : 'owner';
    if (!team || previous === 'owner') {
      return;
    }
    this.workspace.putTeam(withTeamRole(team, userId, role));
    if (previous !== role) {
      const name = this.nameOf(userId);
      this.activity.record(teamRoleEntry(team, name, previous === 'admin', role === 'admin'));
    }
    await this.teamsData.setRole(teamId, userId, role);
  }

  async updateTeam(teamId: string, changes: TeamChanges): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team) {
      return;
    }
    this.workspace.putTeam({ ...team, ...changes });
    teamUpdateEntries(team, changes)
      .reverse()
      .forEach((entry) => this.activity.record(entry, team.workspaceId));
    await this.teamsData.updateTeam(teamId, changes);
  }

  async toggleMembership(teamId: string): Promise<Team | null> {
    const team = this.workspace.team(teamId);
    if (!team) {
      return null;
    }
    const updated = await this.workspace.toggleMembership(teamId);
    this.activity.record(teamMembershipEntry(team, updated.joined), team.workspaceId);
    return updated;
  }

  async setArchived(teamId: string, archived: boolean): Promise<void> {
    const team = this.workspace.anyTeam(teamId);
    if (!team) {
      return;
    }
    this.workspace.putTeam({ ...team, archived });
    this.activity.record(teamArchiveEntry(team, archived), team.workspaceId);
    await this.teamsData.setArchived(teamId, archived);
  }

  private nameOf(userId: string): string {
    return this.workspace.user(userId)?.name ?? UNKNOWN_PERSON;
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
