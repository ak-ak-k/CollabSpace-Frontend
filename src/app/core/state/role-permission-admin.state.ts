import { inject, Service } from '@angular/core';
import { WorkspaceData } from '../data/workspace.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import {
  isLockedPermission,
  Permission,
  RolePermissions,
  withInvitePolicy,
  withPermission,
} from '../models/permission';
import { WorkspaceRole } from '../models/user';
import { InvitePolicy } from '../models/workspace';
import { ActivityLogState } from './activity-log.state';
import { allows } from './permission-check';
import { permissionChangeEntry } from './workspace-audit';
import { roleIn, rolePermissionsIn } from './workspace-access';
import { WorkspaceState } from './workspace.state';

@Service()
export class RolePermissionAdminState {
  private readonly workspace = inject(WorkspaceState);
  private readonly data = inject(WorkspaceData);
  private readonly activity = inject(ActivityLogState);

  toggle(role: WorkspaceRole, permission: Permission): Promise<boolean> {
    const workspaceId = this.workspace.currentWorkspaceId();
    const allowed = role !== 'owner' && !this.permissionsIn(workspaceId)[role].includes(permission);
    return this.set(role, permission, allowed, workspaceId);
  }

  async set(
    role: WorkspaceRole,
    permission: Permission,
    allowed: boolean,
    workspaceId = this.workspace.currentWorkspaceId(),
  ): Promise<boolean> {
    if (role === 'owner' || isLockedPermission(role, permission)) {
      return false;
    }
    const current = this.permissionsIn(workspaceId);
    if (!this.mayManageRolesIn(workspaceId, current)) {
      return false;
    }
    if (current[role].includes(permission) === allowed) {
      return true;
    }
    this.activity.record(permissionChangeEntry(permission, role, allowed), workspaceId);
    const updated = { ...current, [role]: withPermission(current[role], permission, allowed) };
    const syncsInvites = role === 'member' && permission === 'members.invite';
    await Promise.all([
      this.save(updated, workspaceId),
      syncsInvites ? this.syncInvitePolicy(allowed, workspaceId) : null,
    ]);
    return true;
  }

  applyInvitePolicy(policy: InvitePolicy, workspaceId: string): Promise<void> {
    return this.save(withInvitePolicy(this.permissionsIn(workspaceId), policy), workspaceId);
  }

  private permissionsIn(workspaceId: string): RolePermissions {
    const preferences = this.workspace.preferenceMap()[workspaceId] ?? null;
    return rolePermissionsIn(this.workspace.rolePermissionMap(), workspaceId, preferences);
  }

  private mayManageRolesIn(workspaceId: string, rolePermissions: RolePermissions): boolean {
    const role = roleIn(this.workspace.rosters()[workspaceId], CURRENT_USER_ID);
    return allows({ userId: CURRENT_USER_ID, role, rolePermissions }, 'roles.manage');
  }

  private async save(rolePermissions: RolePermissions, workspaceId: string): Promise<void> {
    this.workspace.putRolePermissions(workspaceId, rolePermissions);
    await this.data.updateRolePermissions(workspaceId, rolePermissions);
  }

  private async syncInvitePolicy(membersMayInvite: boolean, workspaceId: string): Promise<void> {
    const current = this.workspace.preferenceMap()[workspaceId];
    const whoCanInvite = membersMayInvite ? 'everyone' : 'admins';
    if (current) {
      this.workspace.putPreferences(workspaceId, { ...current, whoCanInvite });
    }
    await this.data.updatePreferences(workspaceId, { whoCanInvite });
  }
}
