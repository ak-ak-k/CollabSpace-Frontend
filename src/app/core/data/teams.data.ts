import { inject, Service } from '@angular/core';
import { MOCK_ACTIVITY } from '../mocks/activity.mock';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { ActivityEvent } from '../models/activity';
import { Channel, NewChannel } from '../models/channel';
import { NewTeam, Team } from '../models/team';
import { PresenceStatus, User } from '../models/user';
import { MockRequest } from './mock-request';

export interface WorkspaceDirectory {
  readonly users: readonly User[];
  readonly teams: readonly Team[];
  readonly channels: readonly Channel[];
  readonly activity: readonly ActivityEvent[];
}

export interface CreatedTeam {
  readonly team: Team;
  readonly channel: Channel;
}

const EMPTY_DIRECTORY_LISTS = { teams: [], channels: [], activity: [] };

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
      const created = this.buildTeam(newTeam, workspaceId);
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
      };
      const updatedTeam = { ...team, channelIds: [...team.channelIds, channel.id] };
      this.channels = [...this.channels, channel];
      this.teams = this.teams.map((candidate) =>
        candidate.id === team.id ? updatedTeam : candidate,
      );
      return { team: updatedTeam, channel };
    });
  }

  private directory(): WorkspaceDirectory {
    return {
      users: this.users,
      teams: this.teams,
      channels: this.channels,
      activity: MOCK_ACTIVITY,
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

  private join(team: Team): Team {
    return { ...team, joined: true, memberIds: [...team.memberIds, CURRENT_USER_ID] };
  }

  private leave(team: Team): Team {
    const memberIds = team.memberIds.filter((memberId) => memberId !== CURRENT_USER_ID);
    return { ...team, joined: false, memberIds };
  }

  private buildTeam(newTeam: NewTeam, workspaceId: string): CreatedTeam {
    const sequence = ++this.createdTeams;
    const slug = slugOf(newTeam.name);
    const teamId = `t-${slug}-${sequence}`;
    const channelId = `c-${slug}-${sequence}`;
    const createdLabel = monthAndYear(new Date());
    const isPrivate = newTeam.privacy === 'private';
    const team: Team = {
      id: teamId,
      workspaceId,
      name: newTeam.name,
      code: teamCodeOf(newTeam.name),
      description: newTeam.description || 'No description yet.',
      memberIds: [CURRENT_USER_ID],
      leadId: CURRENT_USER_ID,
      channelIds: [channelId],
      activityLevel: 'New',
      weeklyMessageCount: 0,
      createdLabel,
      joined: true,
      isPrivate,
    };
    const channel: Channel = {
      id: channelId,
      teamId,
      name: 'general',
      description: `Announcements and day-to-day conversation for ${newTeam.name}.`,
      memberIds: [CURRENT_USER_ID],
      isPrivate,
      createdLabel,
    };
    return { team, channel };
  }
}

const CODE_LENGTH = 2;

const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'team';

const teamCodeOf = (name: string): string => {
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1
      ? words[0][0] + words[1][0]
      : name.replace(/[^A-Za-z0-9]/g, '').slice(0, CODE_LENGTH);
  return letters.toUpperCase();
};

const monthAndYear = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
