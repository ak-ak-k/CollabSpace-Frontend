import { inject, Service } from '@angular/core';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Channel, ChannelChanges, NewChannel } from '../models/channel';
import { AssignableTeamRole, NewTeam, Team, TeamChanges } from '../models/team';
import {
  channelWithMembers,
  channelWithoutMember,
  withoutTeamMember,
  withTeamMembers,
  withTeamRole,
} from '../models/team-rules';
import { PresenceStatus, User } from '../models/user';
import { MockRequest } from './mock-request';
import { buildTeam, CreatedTeam, monthAndYear, slugOf } from './team-factory';

export type { CreatedTeam } from './team-factory';

export interface WorkspaceDirectory {
  readonly users: readonly User[];
  readonly teams: readonly Team[];
  readonly channels: readonly Channel[];
}

export interface TeamMembership {
  readonly team: Team;
  readonly channels: readonly Channel[];
}

const EMPTY_DIRECTORY_LISTS = { teams: [], channels: [] };

@Service()
export class TeamsData {
  private readonly request = inject(MockRequest);

  private users = [...MOCK_USERS];
  private teams = [...MOCK_TEAMS];
  private channels = [...MOCK_CHANNELS];
  private createdTeams = 0;
  private createdChannels = 0;

  getDirectory(): Promise<WorkspaceDirectory> {
    return this.request.read(() => this.directory(), {
      ...this.directory(),
      ...EMPTY_DIRECTORY_LISTS,
    });
  }

  setPresence(status: PresenceStatus): Promise<User> {
    return this.request.write(() => this.updateCurrentUser({ status }));
  }

  updateProfile(changes: Partial<User>): Promise<User> {
    return this.request.write(() => this.updateCurrentUser(changes));
  }

  toggleMembership(teamId: string): Promise<Team> {
    return this.request.write(() => {
      const team = this.requireTeam(teamId);
      const updated = team.joined ? this.leave(team) : this.join(team);
      this.teams = this.teams.map((candidate) => (candidate.id === teamId ? updated : candidate));
      return updated;
    });
  }

  createTeam(newTeam: NewTeam, workspaceId: string): Promise<CreatedTeam> {
    return this.request.write(() => {
      const created = buildTeam(newTeam, workspaceId, ++this.createdTeams, CURRENT_USER_ID);
      this.teams = [...this.teams, created.team];
      this.channels = [...this.channels, created.channel];
      return created;
    });
  }

  createChannel(newChannel: NewChannel): Promise<CreatedTeam> {
    return this.request.write(() => {
      const team = this.requireTeam(newChannel.teamId);
      const channel: Channel = {
        id: `c-${slugOf(newChannel.name)}-${++this.createdChannels}`,
        teamId: team.id,
        name: newChannel.name,
        description: newChannel.description,
        memberIds: newChannel.isPrivate
          ? [CURRENT_USER_ID]
          : [...new Set([...team.memberIds, CURRENT_USER_ID])],
        isPrivate: newChannel.isPrivate,
        createdLabel: monthAndYear(new Date()),
        createdBy: CURRENT_USER_ID,
      };
      const updatedTeam = { ...team, channelIds: [...team.channelIds, channel.id] };
      this.channels = [...this.channels, channel];
      this.teams = this.teams.map((candidate) =>
        candidate.id === team.id ? updatedTeam : candidate,
      );
      return { team: updatedTeam, channel };
    });
  }

  updateChannel(channelId: string, changes: ChannelChanges): Promise<Channel> {
    return this.request.write(() => {
      const channel = this.channels.find((candidate) => candidate.id === channelId);
      if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
      }
      const updated = { ...channel, ...changes };
      this.channels = this.channels.map((candidate) =>
        candidate.id === channelId ? updated : candidate,
      );
      return updated;
    });
  }

  addMembers(teamId: string, userIds: readonly string[]): Promise<TeamMembership> {
    return this.request.write(() =>
      this.changeMembership(
        withTeamMembers(this.requireTeam(teamId), userIds, CURRENT_USER_ID),
        (channel) => channelWithMembers(channel, userIds),
      ),
    );
  }

  removeMember(teamId: string, userId: string): Promise<TeamMembership> {
    return this.request.write(() =>
      this.changeMembership(
        withoutTeamMember(this.requireTeam(teamId), userId, CURRENT_USER_ID),
        (channel) => channelWithoutMember(channel, userId),
      ),
    );
  }

  setRole(teamId: string, userId: string, role: AssignableTeamRole): Promise<Team> {
    return this.request.write(() =>
      this.saveTeam(withTeamRole(this.requireTeam(teamId), userId, role)),
    );
  }

  updateTeam(teamId: string, changes: TeamChanges): Promise<Team> {
    return this.request.write(() => this.saveTeam({ ...this.requireTeam(teamId), ...changes }));
  }

  setArchived(teamId: string, archived: boolean): Promise<Team> {
    return this.request.write(() => this.saveTeam({ ...this.requireTeam(teamId), archived }));
  }

  private directory(): WorkspaceDirectory {
    return {
      users: this.users,
      teams: this.teams,
      channels: this.channels,
    };
  }

  private updateCurrentUser(changes: Partial<User>): User {
    const current = this.users.find((user) => user.id === CURRENT_USER_ID) as User;
    const updated = { ...current, ...changes };
    this.users = this.users.map((user) => (user.id === CURRENT_USER_ID ? updated : user));
    return updated;
  }

  private requireTeam(teamId: string): Team {
    const team = this.teams.find((candidate) => candidate.id === teamId);
    if (!team) {
      throw new Error(`Unknown team ${teamId}`);
    }
    return team;
  }

  private saveTeam(team: Team): Team {
    this.teams = this.teams.map((candidate) => (candidate.id === team.id ? team : candidate));
    return team;
  }

  private changeMembership(team: Team, change: (channel: Channel) => Channel): TeamMembership {
    this.saveTeam(team);
    const channels = this.channels
      .filter((channel) => team.channelIds.includes(channel.id))
      .map(change);
    const changed = new Map(channels.map((channel) => [channel.id, channel]));
    this.channels = this.channels.map((channel) => changed.get(channel.id) ?? channel);
    return { team, channels };
  }

  private join(team: Team): Team {
    return { ...team, joined: true, memberIds: [...team.memberIds, CURRENT_USER_ID] };
  }

  private leave(team: Team): Team {
    const memberIds = team.memberIds.filter((memberId) => memberId !== CURRENT_USER_ID);
    return { ...team, joined: false, memberIds };
  }
}
