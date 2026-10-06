import { inject, Service } from '@angular/core';
import { WorkspaceData, workspaceCodeOf } from '../data/workspace.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import {
  isLockedPermission,
  Permission,
  RolePermissions,
  withInvitePolicy,
  withPermission,
} from '../models/permission';
import { User, WorkspaceRole } from '../models/user';
import {
  NewWorkspace,
  Workspace,
  WorkspaceChanges,
  WorkspacePatch,
  WorkspacePreferences,
} from '../models/workspace';
import {
  canChangeRole,
  canTransferOwnership,
  ownerCountOf,
  withTransferredOwnership,
} from '../models/workspace-role';
import { ActivityLogState } from './activity-log.state';
import {
  memberRemovedEntry,
  memberRestoredEntry,
  ownershipTransferEntry,
  permissionChangeEntry,
  preferenceEntries,
  roleChangeEntry,
  workspaceArchiveEntry,
  workspaceDeletionEntry,
  workspaceDetailsEntry,
  workspaceLogoEntry,
} from './workspace-audit';
import { WorkspaceState } from './workspace.state';

const UNKNOWN_PERSON = 'Someone';

const MILLISECONDS_PER_DAY = 86_400_000;
export const DELETION_GRACE_DAYS = 14;

@Service()
export class WorkspaceAdminState {
  private readonly workspace = inject(WorkspaceState);
  private readonly data = inject(WorkspaceData);
  private readonly activity = inject(ActivityLogState);

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
    this.workspace.putRolePermissions(created.workspace.id, created.rolePermissions);
    this.workspace.switchWorkspace(created.workspace.id);
    return created.workspace;
  }

  updateWorkspace(changes: WorkspaceChanges): Promise<void> {
    const current = this.workspace.currentWorkspace();
    const entry = current ? workspaceDetailsEntry(current, changes) : null;
    if (entry) {
      this.activity.record(entry);
    }
    return this.patch(changes);
  }

  setLogo(logoUrl: string | null): Promise<void> {
    this.activity.record(workspaceLogoEntry(logoUrl));
    return this.patch({ logoUrl });
  }

  setArchived(archived: boolean): Promise<void> {
    this.activity.record(workspaceArchiveEntry(archived));
    return this.patch({ archivedAt: archived ? Date.now() : null });
  }

  scheduleDeletion(scheduled: boolean): Promise<void> {
    const deleteAt = scheduled ? Date.now() + DELETION_GRACE_DAYS * MILLISECONDS_PER_DAY : null;
    this.activity.record(workspaceDeletionEntry(scheduled));
    return this.patch({ deleteAt });
  }

  async updatePreferences(changes: Partial<WorkspacePreferences>): Promise<void> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const current = this.workspace.preferences();
    preferenceEntries(current, changes).forEach((entry) => this.activity.record(entry));
    if (current) {
      this.workspace.putPreferences(workspaceId, { ...current, ...changes });
    }
    const invitePolicy = changes.whoCanInvite;
    const permissionsSaved = invitePolicy
      ? this.saveRolePermissions(withInvitePolicy(this.workspace.rolePermissions(), invitePolicy))
      : Promise.resolve();
    const [saved] = await Promise.all([
      this.data.updatePreferences(workspaceId, changes),
      permissionsSaved,
    ]);
    this.workspace.putPreferences(workspaceId, saved);
  }

  async toggleRolePermission(role: WorkspaceRole, permission: Permission): Promise<boolean> {
    if (role === 'owner' || isLockedPermission(role, permission)) {
      return false;
    }
    if (!this.workspace.can('roles.manage')) {
      return false;
    }
    const current = this.workspace.rolePermissions();
    const allowed = !current[role].includes(permission);
    this.activity.record(permissionChangeEntry(permission, role, allowed));
    const saved = this.saveRolePermissions({
      ...current,
      [role]: withPermission(current[role], permission, allowed),
    });
    const syncsInvites = role === 'member' && permission === 'members.invite';
    await Promise.all([saved, syncsInvites ? this.syncInvitePolicy(allowed) : null]);
    return true;
  }

  async setRole(userId: string, role: WorkspaceRole): Promise<boolean> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const roster = this.workspace.roster();
    const permitted = this.mayManage(roster[userId]) && this.mayManage(role);
    if (!permitted || !canChangeRole(roster, userId, role, CURRENT_USER_ID)) {
      return false;
    }
    this.workspace.putRoster(workspaceId, { ...roster, [userId]: role });
    this.activity.record(roleChangeEntry(this.memberOf(userId), roster[userId], role));
    await this.data.setRole(workspaceId, userId, role);
    return true;
  }

  canTransferTo(userId: string): boolean {
    return canTransferOwnership(this.workspace.roster(), userId, CURRENT_USER_ID);
  }

  async transferOwnership(userId: string): Promise<boolean> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const roster = this.workspace.roster();
    if (!canTransferOwnership(roster, userId, CURRENT_USER_ID)) {
      return false;
    }
    this.workspace.putRoster(
      workspaceId,
      withTransferredOwnership(roster, userId, CURRENT_USER_ID),
    );
    this.activity.record(ownershipTransferEntry(this.memberOf(userId)));
    await Promise.all([
      this.data.transferOwnership(workspaceId, userId, CURRENT_USER_ID),
      this.patch({ ownerId: userId }),
    ]);
    return true;
  }

  canRemove(userId: string): boolean {
    const roster = this.workspace.roster();
    const role = roster[userId];
    const lastOwner = role === 'owner' && ownerCountOf(roster) < 2;
    return !!role && userId !== CURRENT_USER_ID && !lastOwner && this.mayManage(role);
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
    this.activity.record(memberRemovedEntry(this.memberOf(userId)));
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
    this.activity.record(memberRestoredEntry(this.memberOf(userId)), workspaceId);
    await this.data.setRole(workspaceId, userId, role);
  }

  private mayManage(role: WorkspaceRole | undefined): boolean {
    const ownerOnly = role === 'owner' && !this.workspace.access().isOwner;
    return this.workspace.can('members.manage') && !ownerOnly;
  }

  private async saveRolePermissions(rolePermissions: RolePermissions): Promise<void> {
    const workspaceId = this.workspace.currentWorkspaceId();
    this.workspace.putRolePermissions(workspaceId, rolePermissions);
    await this.data.updateRolePermissions(workspaceId, rolePermissions);
  }

  private async syncInvitePolicy(membersMayInvite: boolean): Promise<void> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const current = this.workspace.preferences();
    const whoCanInvite = membersMayInvite ? 'everyone' : 'admins';
    if (current) {
      this.workspace.putPreferences(workspaceId, { ...current, whoCanInvite });
    }
    await this.data.updatePreferences(workspaceId, { whoCanInvite });
  }

  private memberOf(userId: string): Pick<User, 'id' | 'name'> {
    return { id: userId, name: this.workspace.user(userId)?.name ?? UNKNOWN_PERSON };
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
