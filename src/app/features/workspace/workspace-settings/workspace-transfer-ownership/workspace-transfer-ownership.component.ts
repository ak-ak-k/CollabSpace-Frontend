import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user';
import { DialogService } from '../../../../core/services/dialog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceAdminState } from '../../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { DangerZoneComponent } from '../../../settings/danger-zone/danger-zone.component';
import { transferCandidatesOf } from '../workspace-settings-view';

const NO_NEW_OWNER: SelectOption = { value: '', label: 'Choose a member' };
const NEW_OWNER_ROUTE = '/workspace/members/admins';

@Component({
  selector: 'app-workspace-transfer-ownership',
  imports: [ButtonComponent, DangerZoneComponent, IconComponent, SelectComponent],
  templateUrl: './workspace-transfer-ownership.component.html',
  styleUrl: './workspace-transfer-ownership.component.scss',
})
export class WorkspaceTransferOwnershipComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  private readonly workspaceName = computed(() => this.workspace.currentWorkspace()?.name ?? '');

  protected readonly newOwnerId = signal('');
  protected readonly options = computed<readonly SelectOption[]>(() => [
    NO_NEW_OWNER,
    ...transferCandidatesOf(this.workspace.members(), this.workspace.currentUser()?.id),
  ]);

  protected async transfer(): Promise<void> {
    const newOwner = this.workspace.user(this.newOwnerId());
    if (!newOwner || !this.admin.canTransferTo(newOwner.id)) {
      return;
    }
    const confirmed = await this.confirm(newOwner);
    if (!confirmed || !this.admin.canTransferTo(newOwner.id)) {
      return;
    }
    void this.admin.transferOwnership(newOwner.id);
    this.newOwnerId.set('');
    this.toasts.show(`${newOwner.name} is now the Owner of ${this.workspaceName()}`, {
      icon: 'crown',
    });
    void this.router.navigateByUrl(NEW_OWNER_ROUTE);
  }

  private confirm({ name }: User): Promise<boolean> {
    const workspaceName = this.workspaceName();
    return this.dialogs.confirm({
      icon: 'crown',
      title: `Transfer ownership to ${name}?`,
      body: `${name} becomes the Owner of ${workspaceName}. You’ll become an Admin and lose Owner-only controls, like deleting the workspace.`,
      confirmLabel: 'Transfer ownership',
      confirmText: workspaceName,
    });
  }
}
