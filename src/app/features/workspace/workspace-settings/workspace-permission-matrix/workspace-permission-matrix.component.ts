import { Component, computed, inject } from '@angular/core';
import { WORKSPACE_ROLE_DETAILS } from '../../../../core/models/workspace-role';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceAdminState } from '../../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { TooltipDirective } from '../../../../shared/ui/tooltip/tooltip.directive';
import {
  PermissionCellView,
  permissionRowsOf,
  permissionToggleMessageOf,
} from '../role-permissions-view';

@Component({
  selector: 'app-workspace-permission-matrix',
  imports: [IconComponent, TableComponent, TooltipDirective],
  templateUrl: './workspace-permission-matrix.component.html',
  styleUrl: './workspace-permission-matrix.component.scss',
})
export class WorkspacePermissionMatrixComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly toasts = inject(ToastService);

  protected readonly roles = WORKSPACE_ROLE_DETAILS;
  protected readonly rows = computed(() =>
    permissionRowsOf(this.workspace.rolePermissions(), this.workspace.access().canManageRoles),
  );

  protected toggle(cell: PermissionCellView): void {
    if (!cell.editable) {
      return;
    }
    this.flip(cell);
    this.toasts.show(permissionToggleMessageOf(cell), {
      icon: 'shield-check',
      actionLabel: 'Undo',
      onAction: () => this.flip(cell),
    });
  }

  private flip({ role, permission }: PermissionCellView): void {
    void this.admin.toggleRolePermission(role, permission);
  }
}
