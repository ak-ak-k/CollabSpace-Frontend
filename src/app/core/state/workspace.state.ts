import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { CreatedTeam, TeamsData, WorkspaceDirectory } from '../data/teams.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { CURRENT_WORKSPACE_ID } from '../mocks/workspaces.mock';
import { ActivityEvent } from '../models/activity';
import { Channel } from '../models/channel';
import { NewTeam, Team } from '../models/team';
import { PresenceStatus, User } from '../models/user';
import { Workspace } from '../models/workspace';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

@Service()
export class WorkspaceState {
  private readonly data = inject(TeamsData);
  private readonly dataMode = inject(DataModeState);

  readonly users = signal<readonly User[]>([]);
  readonly workspaces = signal<readonly Workspace[]>([]);
  readonly teams = signal<readonly Team[]>([]);
  readonly channels = signal<readonly Channel[]>([]);
  readonly activity = signal<readonly ActivityEvent[]>([]);
  readonly currentWorkspaceId = signal(CURRENT_WORKSPACE_ID);

  private readonly loader = new Loadable<WorkspaceDirectory>({
    fetch: () => this.data.getDirectory(),
    store: (directory) => this.store(directory),
    isEmpty: (directory) => directory.teams.length === 0,
  });

  readonly status = this.loader.status;

  readonly usersById = computed(() => new Map(this.users().map((user) => [user.id, user])));
  readonly currentUser = computed(() => this.usersById().get(CURRENT_USER_ID) ?? null);
  readonly currentWorkspace = computed(
    () => this.workspaces().find((workspace) => workspace.id === this.currentWorkspaceId()) ?? null,
  );
  readonly joinedTeams = computed(() => this.teams().filter((team) => team.joined));
  readonly onlineUserCount = computed(
    () => this.users().filter((user) => user.status === 'online').length,
  );
  readonly recentActivity = computed(() =>
    [...this.activity()].sort((first, second) => second.occurredAt - first.occurredAt),
  );

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  user(userId: string | null): User | null {
    return userId ? (this.usersById().get(userId) ?? null) : null;
  }

  team(teamId: string): Team | null {
    return this.teams().find((team) => team.id === teamId) ?? null;
  }

  switchWorkspace(workspaceId: string): void {
    this.currentWorkspaceId.set(workspaceId);
  }

  async setPresence(status: PresenceStatus): Promise<void> {
    this.replaceUser(await this.data.setPresence(status));
  }

  async updateProfile(changes: Partial<User>): Promise<void> {
    this.replaceUser(await this.data.updateProfile(changes));
  }

  async toggleMembership(teamId: string): Promise<Team> {
    const updated = await this.data.toggleMembership(teamId);
    this.teams.update((teams) => teams.map((team) => (team.id === teamId ? updated : team)));
    return updated;
  }

  async createTeam(newTeam: NewTeam): Promise<CreatedTeam> {
    const created = await this.data.createTeam(newTeam);
    this.teams.update((teams) => [...teams, created.team]);
    this.channels.update((channels) => [...channels, created.channel]);
    return created;
  }

  private store(directory: WorkspaceDirectory): void {
    this.users.set(directory.users);
    this.workspaces.set(directory.workspaces);
    this.teams.set(directory.teams);
    this.channels.set(directory.channels);
    this.activity.set(directory.activity);
  }

  private replaceUser(updated: User): void {
    this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
  }
}
