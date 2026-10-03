import { inject, Service } from '@angular/core';
import { WorkspaceData, workspaceCodeOf } from '../data/workspace.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { WorkspaceRole } from '../models/user';
import {
  NewWorkspace,
  Workspace,
  WorkspaceChanges,
  WorkspacePatch,
  WorkspacePreferences,
} from '../models/workspace';
import { canChangeRole, ownerCountOf } from '../models/workspace-role';
import { WorkspaceState } from './workspace.state';

const MILLISECONDS_PER_DAY = 86_400_000;
export const DELETION_GRACE_DAYS = 14;

@Service()
export class WorkspaceAdminState {
  private readonly workspace = inject(WorkspaceState);
  private readonly data = inject(WorkspaceData);

  isSlugTaken(slug: string): boolean {
    const currentId = this.workspace.currentWorkspaceId();
    return this.workspace
      .workspaces()
      .some((workspace) => workspace.slug === slug && workspace.id !== currentId);
  }

  isSlugInUse(slug: string): boolean {
    return this.workspace.workspaces().some((workspace) => workspace.slug === slug);
  }

  async createWorkspace(draft: NewWorkspace): Promise<Workspace> {
    const created = await this.data.createWorkspace(draft, CURRENT_USER_ID);
    this.workspace.putWorkspace(created.workspace);
    this.workspace.putRoster(created.workspace.id, created.roster);
    this.workspace.putPreferences(created.workspace.id, created.preferences);
    this.workspace.switchWorkspace(created.workspace.id);
    return created.workspace;
  }

  updateWorkspace(changes: WorkspaceChanges): Promise<void> {
    return this.patch(changes);
  }

  setLogo(logoUrl: string | null): Promise<void> {
    return this.patch({ logoUrl });
  }

  setArchived(archived: boolean): Promise<void> {
    return this.patch({ archivedAt: archived ? Date.now() : null });
  }

  scheduleDeletion(scheduled: boolean): Promise<void> {
    const deleteAt = scheduled ? Date.now() + DELETION_GRACE_DAYS * MILLISECONDS_PER_DAY : null;
    return this.patch({ deleteAt });
  }

  async updatePreferences(changes: Partial<WorkspacePreferences>): Promise<void> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const current = this.workspace.preferences();
    if (current) {
      this.workspace.putPreferences(workspaceId, { ...current, ...changes });
    }
    this.workspace.putPreferences(
      workspaceId,
      await this.data.updatePreferences(workspaceId, changes),
    );
  }

  async setRole(userId: string, role: WorkspaceRole): Promise<boolean> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const roster = this.workspace.roster();
    if (!canChangeRole(roster, userId, role, CURRENT_USER_ID)) {
      return false;
    }
    this.workspace.putRoster(workspaceId, { ...roster, [userId]: role });
    await this.data.setRole(workspaceId, userId, role);
    return true;
  }

  canRemove(userId: string): boolean {
    const roster = this.workspace.roster();
    const role = roster[userId];
    const lastOwner = role === 'owner' && ownerCountOf(roster) < 2;
    return !!role && userId !== CURRENT_USER_ID && !lastOwner;
  }

  async removeMember(userId: string): Promise<WorkspaceRole | null> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const roster = this.workspace.roster();
    const role = roster[userId];
    if (!role || !this.canRemove(userId)) {
      return null;
    }
    this.workspace.putRoster(
      workspaceId,
      Object.fromEntries(Object.entries(roster).filter(([memberId]) => memberId !== userId)),
    );
    await this.data.removeMember(workspaceId, userId);
    return role;
  }

  async restoreMember(
    userId: string,
    role: WorkspaceRole,
    workspaceId = this.workspace.currentWorkspaceId(),
  ): Promise<void> {
    const roster = this.workspace.rosters()[workspaceId] ?? {};
    this.workspace.putRoster(workspaceId, { ...roster, [userId]: role });
    await this.data.setRole(workspaceId, userId, role);
  }

  private async patch(patch: WorkspacePatch): Promise<void> {
    const current = this.workspace.currentWorkspace();
    if (!current) {
      return;
    }
    const code = patch.name ? { code: workspaceCodeOf(patch.name) } : {};
    this.workspace.putWorkspace({ ...current, ...patch, ...code });
    this.workspace.putWorkspace(await this.data.patchWorkspace(current.id, patch));
  }
}
