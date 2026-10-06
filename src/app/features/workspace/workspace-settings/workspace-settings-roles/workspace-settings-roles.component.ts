import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceRole } from '../../../../core/models/user';
import { WORKSPACE_ROLE_DETAILS } from '../../../../core/models/workspace-role';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { formatCount } from '../../../../shared/pipes/count.pipe';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { IconName } from '../../../../shared/ui/icon/icon-registry';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { RolePermissionView, rolePermissionListOf } from '../role-permissions-view';
import { WorkspacePermissionMatrixComponent } from '../workspace-permission-matrix/workspace-permission-matrix.component';

interface RoleRow {
  readonly role: WorkspaceRole;
  readonly label: string;
  readonly description: string;
  readonly icon: IconName;
  readonly count: number;
  readonly countLabel: string;
  readonly countAria: string;
  readonly link: string;
  readonly permissionsLabel: string;
  readonly permissions: readonly RolePermissionView[];
}

const ROLE_ICONS: Record<WorkspaceRole, IconName> = {
  owner: 'crown',
  admin: 'shield-check',
  member: 'user',
  guest: 'user-check',
};

const ROLE_FILTERS: Record<WorkspaceRole, string> = {
  owner: 'admins',
  admin: 'admins',
  member: 'members',
  guest: 'guests',
};

@Component({
  selector: 'app-workspace-settings-roles',
  imports: [
    RouterLink,
    CardComponent,
    IconComponent,
    TableComponent,
    WorkspacePermissionMatrixComponent,
  ],
  templateUrl: './workspace-settings-roles.component.html',
  styleUrl: './workspace-settings-roles.component.scss',
})
export class WorkspaceSettingsRolesComponent {
  private readonly workspace = inject(WorkspaceState);

  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly rolesCaption = computed(
    () => `Roles in ${this.workspace.currentWorkspace()?.name ?? 'this workspace'}`,
  );
  protected readonly rows = computed<readonly RoleRow[]>(() => {
    const members = this.workspace.members();
    const rolePermissions = this.workspace.rolePermissions();
    return WORKSPACE_ROLE_DETAILS.map(({ role, label, description }) => {
      const count = members.filter((member) => member.role === role).length;
      return {
        role,
        label,
        description,
        icon: ROLE_ICONS[role],
        count,
        countLabel: formatCount(count, 'member'),
        countAria: `View ${formatCount(count, role)}`,
        link: `/workspace/members/${ROLE_FILTERS[role]}`,
        permissionsLabel: `What ${role}s can do`,
        permissions: rolePermissionListOf(role, rolePermissions),
      };
    });
  });
}
