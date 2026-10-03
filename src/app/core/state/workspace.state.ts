import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { CreatedTeam, TeamsData, WorkspaceDirectory } from '../data/teams.data';
import { WorkspaceCatalog, WorkspaceData } from '../data/workspace.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { CURRENT_WORKSPACE_ID } from '../mocks/workspaces.mock';
import { ActivityEvent } from '../models/activity';
import { Channel, NewChannel } from '../models/channel';
import { Conversation } from '../models/conversation';
import { NewTeam, Team } from '../models/team';
import { PresenceStatus, User } from '../models/user';
import {
  Workspace,
  WorkspacePreferenceMap,
  WorkspacePreferences,
  WorkspaceRoster,
  WorkspaceRosters,
  WorkspaceScoped,
} from '../models/workspace';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import {
  accessOf,
  conversationInScope,
  roleIn,
  summariesOf,
  withRosterRole,
} from './workspace-access';

interface WorkspaceSnapshot {
  readonly directory: WorkspaceDirectory;
  readonly catalog: WorkspaceCatalog;
}

@Service()
export class WorkspaceState {
  private readonly teamsData = inject(TeamsData);
  private readonly workspaceData = inject(WorkspaceData);
  private readonly dataMode = inject(DataModeState);

  private readonly directoryUsers = signal<readonly User[]>([]);
  private readonly allTeams = signal<readonly Team[]>([]);
  private readonly allChannels = signal<readonly Channel[]>([]);
  private readonly allActivity = signal<readonly ActivityEvent[]>([]);

  readonly workspaces = signal<readonly Workspace[]>([]);
  readonly rosters = signal<WorkspaceRosters>({});
  readonly preferenceMap = signal<WorkspacePreferenceMap>({});
  readonly currentWorkspaceId = signal(CURRENT_WORKSPACE_ID);

  private readonly loader = new Loadable<WorkspaceSnapshot>({
    fetch: () => this.fetchSnapshot(),
    store: (snapshot) => this.store(snapshot),
    isEmpty: (snapshot) => snapshot.directory.teams.length === 0,
  });

  readonly roster = computed<WorkspaceRoster>(
    () => this.rosters()[this.currentWorkspaceId()] ?? {},
  );

  readonly users = computed(() =>
    this.directoryUsers().map((user) => withRosterRole(user, this.roster())),
  );
  readonly usersById = computed(() => new Map(this.users().map((user) => [user.id, user])));
  readonly memberIds = computed(() => new Set(Object.keys(this.roster())));
  readonly members = computed(() => this.users().filter((user) => this.memberIds().has(user.id)));
  readonly currentUser = computed(() => this.usersById().get(CURRENT_USER_ID) ?? null);
  readonly currentWorkspace = computed(
    () => this.workspaces().find((workspace) => workspace.id === this.currentWorkspaceId()) ?? null,
  );
  readonly preferences = computed<WorkspacePreferences | null>(
    () => this.preferenceMap()[this.currentWorkspaceId()] ?? null,
  );
  readonly isArchived = computed(() => !!this.currentWorkspace()?.archivedAt);
  readonly access = computed(() =>
    accessOf(roleIn(this.roster(), CURRENT_USER_ID), this.preferences()),
  );
  readonly summaries = computed(() =>
    summariesOf(this.workspaces(), this.rosters(), this.currentWorkspaceId(), CURRENT_USER_ID),
  );

  readonly teams = computed(() => this.allTeams().filter((team) => this.contains(team)));
  readonly teamIds = computed(() => new Set(this.teams().map((team) => team.id)));
  readonly channels = computed(() =>
    this.allChannels().filter((channel) => this.teamIds().has(channel.teamId)),
  );
  readonly activity = computed(() =>
    this.allActivity().filter((event) => this.teamIds().has(event.teamId)),
  );
  readonly joinedTeams = computed(() => this.teams().filter((team) => team.joined));
  readonly onlineUserCount = computed(
    () => this.members().filter((user) => user.status === 'online').length,
  );
  readonly recentActivity = computed(() =>
    [...this.activity()].sort((first, second) => second.occurredAt - first.occurredAt),
  );

  readonly loadStatus = this.loader.status.asReadonly();
  readonly status = settledStatus(this.loader.status, () => this.teams().length === 0);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  contains(item: WorkspaceScoped): boolean {
    return item.workspaceId === this.currentWorkspaceId();
  }

  containsConversation(conversation: Conversation): boolean {
    return conversationInScope(conversation, this.currentWorkspaceId(), this.teamIds());
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
    this.replaceUser(await this.teamsData.setPresence(status));
  }

  async updateProfile(changes: Partial<User>): Promise<void> {
    this.replaceUser(await this.teamsData.updateProfile(changes));
  }

  async toggleMembership(teamId: string): Promise<Team> {
    const updated = await this.teamsData.toggleMembership(teamId);
    this.allTeams.update((teams) => teams.map((team) => (team.id === teamId ? updated : team)));
    return updated;
  }

  putWorkspace(workspace: Workspace): void {
    this.workspaces.update((workspaces) =>
      workspaces.some((candidate) => candidate.id === workspace.id)
        ? workspaces.map((candidate) => (candidate.id === workspace.id ? workspace : candidate))
        : [...workspaces, workspace],
    );
  }

  putRoster(workspaceId: string, roster: WorkspaceRoster): void {
    this.rosters.update((rosters) => ({ ...rosters, [workspaceId]: roster }));
  }

  putPreferences(workspaceId: string, preferences: WorkspacePreferences): void {
    this.preferenceMap.update((map) => ({ ...map, [workspaceId]: preferences }));
  }

  async createChannel(newChannel: NewChannel): Promise<Channel> {
    const { team, channel } = await this.teamsData.createChannel(newChannel);
    this.allTeams.update((teams) =>
      teams.map((candidate) => (candidate.id === team.id ? team : candidate)),
    );
    this.allChannels.update((channels) => [...channels, channel]);
    return channel;
  }

  async createTeam(newTeam: NewTeam): Promise<CreatedTeam> {
    const created = await this.teamsData.createTeam(newTeam, this.currentWorkspaceId());
    this.allTeams.update((teams) => [...teams, created.team]);
    this.allChannels.update((channels) => [...channels, created.channel]);
    return created;
  }

  private async fetchSnapshot(): Promise<WorkspaceSnapshot> {
    const [directory, catalog] = await Promise.all([
      this.teamsData.getDirectory(),
      this.workspaceData.getCatalog(),
    ]);
    return { directory, catalog };
  }

  private store({ directory, catalog }: WorkspaceSnapshot): void {
    this.directoryUsers.set(directory.users);
    this.allTeams.set(directory.teams);
    this.allChannels.set(directory.channels);
    this.allActivity.set(directory.activity);
    this.workspaces.set(catalog.workspaces);
    this.rosters.set(catalog.rosters);
    this.preferenceMap.set(catalog.preferences);
  }

  private replaceUser(updated: User): void {
    this.directoryUsers.update((users) =>
      users.map((user) => (user.id === updated.id ? updated : user)),
    );
  }
}
