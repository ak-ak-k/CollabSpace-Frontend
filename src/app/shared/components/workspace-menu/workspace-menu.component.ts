import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workspace } from '../../../core/models/workspace';
import { ToastService } from '../../../core/services/toast.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { DROPDOWN_IMPORTS } from '../../ui/dropdown/dropdown-imports';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-workspace-menu',
  imports: [...DROPDOWN_IMPORTS, RouterLink, AvatarComponent, IconComponent],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss',
})
export class WorkspaceMenuComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);

  protected readonly workspaces = this.workspace.workspaces;
  protected readonly currentId = this.workspace.currentWorkspaceId;

  protected pick(workspace: Workspace): void {
    if (workspace.id === this.currentId()) {
      return;
    }
    this.workspace.switchWorkspace(workspace.id);
    this.toasts.show(`Switched to ${workspace.name} (demo keeps Northstar data)`, {
      icon: 'building-2',
    });
  }
}
