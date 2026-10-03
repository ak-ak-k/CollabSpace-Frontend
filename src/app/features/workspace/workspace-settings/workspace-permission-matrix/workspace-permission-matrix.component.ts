import { Component, inject } from '@angular/core';
import { PreferencesState } from '../../../../core/state/preferences.state';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';

export const permissionLabelOf = (role: string, permission: string, allowed: boolean): string =>
  `${role} ${allowed ? 'can' : 'cannot'} ${permission.toLowerCase()}`;

@Component({
  selector: 'app-workspace-permission-matrix',
  imports: [IconComponent, TableComponent],
  templateUrl: './workspace-permission-matrix.component.html',
  styleUrl: './workspace-permission-matrix.component.scss',
})
export class WorkspacePermissionMatrixComponent {
  private readonly state = inject(PreferencesState);

  protected readonly roleNames = this.state.roleNames;
  protected readonly permissions = this.state.rolePermissions;
  protected readonly permissionLabelOf = permissionLabelOf;
}
