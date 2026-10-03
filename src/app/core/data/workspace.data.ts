import { inject, Service } from '@angular/core';
import { MOCK_WORKSPACE_ACTIVITY } from '../mocks/workspace-activity.mock';
import {
  BASE_WORKSPACE_PREFERENCES,
  MOCK_WORKSPACE_PREFERENCES,
  MOCK_WORKSPACE_ROSTERS,
  MOCK_WORKSPACES,
} from '../mocks/workspaces.mock';
import { WorkspaceRole } from '../models/user';
import {
  NewWorkspace,
  Workspace,
  WorkspacePatch,
  WorkspacePreferenceMap,
  WorkspacePreferences,
  WorkspaceRoster,
  WorkspaceRosters,
} from '../models/workspace';
import { WorkspaceActivityEvent } from '../models/workspace-activity';
import { MockRequest } from './mock-request';

export interface WorkspaceCatalog {
  readonly workspaces: readonly Workspace[];
  readonly rosters: WorkspaceRosters;
  readonly preferences: WorkspacePreferenceMap;
}

export interface CreatedWorkspace {
  readonly workspace: Workspace;
  readonly roster: WorkspaceRoster;
  readonly preferences: WorkspacePreferences;
}

const CODE_LENGTH = 2;
const NEW_WORKSPACE_PLAN = 'Free';

export const workspaceCodeOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? 'W');
  return letters.slice(0, CODE_LENGTH).toUpperCase();
};

const monthAndYear = (date: Date): string =>
  date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

@Service()
export class WorkspaceData {
  private readonly request = inject(MockRequest);

  private workspaces = [...MOCK_WORKSPACES];
  private rosters: WorkspaceRosters = MOCK_WORKSPACE_ROSTERS;
  private preferences: WorkspacePreferenceMap = MOCK_WORKSPACE_PREFERENCES;
  private activity = [...MOCK_WORKSPACE_ACTIVITY];
  private createdWorkspaces = 0;

  getCatalog(): Promise<WorkspaceCatalog> {
    return this.request.read(() => this.catalog(), this.catalog());
  }

  getActivity(): Promise<readonly WorkspaceActivityEvent[]> {
    return this.request.read(() => this.activity, []);
  }

  createWorkspace(draft: NewWorkspace, ownerId: string): Promise<CreatedWorkspace> {
    return this.request.write(() => {
      const workspace: Workspace = {
        id: `w-new-${++this.createdWorkspaces}`,
        name: draft.name,
        code: workspaceCodeOf(draft.name),
        plan: NEW_WORKSPACE_PLAN,
        slug: draft.slug,
        description: draft.description,
        createdLabel: monthAndYear(new Date()),
        ownerId,
        domain: '',
        logoUrl: null,
        archivedAt: null,
        deleteAt: null,
      };
      const roster: WorkspaceRoster = { [ownerId]: 'owner' };
      const preferences = BASE_WORKSPACE_PREFERENCES;
      this.workspaces = [...this.workspaces, workspace];
      this.rosters = { ...this.rosters, [workspace.id]: roster };
      this.preferences = { ...this.preferences, [workspace.id]: preferences };
      return { workspace, roster, preferences };
    });
  }

  patchWorkspace(workspaceId: string, patch: WorkspacePatch): Promise<Workspace> {
    return this.request.write(() => {
      const named = patch.name ? { code: workspaceCodeOf(patch.name) } : {};
      const updated = { ...this.requireWorkspace(workspaceId), ...patch, ...named };
      this.workspaces = this.workspaces.map((workspace) =>
        workspace.id === workspaceId ? updated : workspace,
      );
      return updated;
    });
  }

  updatePreferences(
    workspaceId: string,
    changes: Partial<WorkspacePreferences>,
  ): Promise<WorkspacePreferences> {
    return this.request.write(() => {
      const updated = { ...this.preferences[workspaceId], ...changes };
      this.preferences = { ...this.preferences, [workspaceId]: updated };
      return updated;
    });
  }

  setRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceRoster> {
    return this.writeRoster(workspaceId, (roster) => ({ ...roster, [userId]: role }));
  }

  removeMember(workspaceId: string, userId: string): Promise<WorkspaceRoster> {
    return this.writeRoster(workspaceId, (roster) =>
      Object.fromEntries(Object.entries(roster).filter(([memberId]) => memberId !== userId)),
    );
  }

  recordActivity(event: WorkspaceActivityEvent): Promise<void> {
    return this.request.write(() => {
      this.activity = [event, ...this.activity];
    });
  }

  removeActivity(eventId: string): Promise<void> {
    return this.request.write(() => {
      this.activity = this.activity.filter((event) => event.id !== eventId);
    });
  }

  private writeRoster(
    workspaceId: string,
    change: (roster: WorkspaceRoster) => WorkspaceRoster,
  ): Promise<WorkspaceRoster> {
    return this.request.write(() => {
      const roster = change(this.rosters[workspaceId] ?? {});
      this.rosters = { ...this.rosters, [workspaceId]: roster };
      return roster;
    });
  }

  private catalog(): WorkspaceCatalog {
    return { workspaces: this.workspaces, rosters: this.rosters, preferences: this.preferences };
  }

  private requireWorkspace(workspaceId: string): Workspace {
    const workspace = this.workspaces.find((candidate) => candidate.id === workspaceId);
    if (!workspace) {
      throw new Error(`Unknown workspace ${workspaceId}`);
    }
    return workspace;
  }
}
