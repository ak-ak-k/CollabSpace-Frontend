import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { WorkspaceRole } from '../../../core/models/user';
import { WORKSPACE_ROLE_DETAILS } from '../../../core/models/workspace-role';
import { ConnectionGuard } from '../../../core/services/connection-guard.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { TagComponent } from '../../../shared/ui/tag/tag.component';

export interface ChangeRoleDialogData {
  readonly userId: string;
}

interface RoleChoice {
  readonly role: WorkspaceRole;
  readonly label: string;
  readonly description: string;
  readonly current: boolean;
  readonly disabled: boolean;
}

const FALLBACK_ROLE: WorkspaceRole = 'member';

@Component({
  selector: 'app-change-role-dialog',
  imports: [ButtonComponent, IconComponent, ModalComponent, TagComponent],
  templateUrl: './change-role-dialog.component.html',
  styleUrl: './change-role-dialog.component.scss',
})
export class ChangeRoleDialogComponent {
  private readonly dialogRef = inject<DialogRef<WorkspaceRole>>(DialogRef);
  private readonly data = inject<ChangeRoleDialogData>(DIALOG_DATA);
  private readonly workspace = inject(WorkspaceState);
  private readonly connection = inject(ConnectionGuard);

  protected readonly idPrefix = createOverlayId('change-role');
  protected readonly member = computed(() => this.workspace.user(this.data.userId));
  private readonly currentRole = this.member()?.role ?? FALLBACK_ROLE;

  protected readonly choice = signal<WorkspaceRole>(this.currentRole);
  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );
  protected readonly subtitle = computed(() => {
    const member = this.member();
    return member ? `${member.name} · ${member.email}` : '';
  });
  protected readonly choices = computed<readonly RoleChoice[]>(() => {
    const isOwner = this.workspace.access().isOwner;
    return WORKSPACE_ROLE_DETAILS.map((details) => ({
      role: details.role,
      label: details.label,
      description: details.description,
      current: details.role === this.currentRole,
      disabled: details.role === 'owner' && !isOwner,
    }));
  });
  protected readonly promotesToOwner = computed(
    () => this.choice() === 'owner' && this.currentRole !== 'owner',
  );
  protected readonly unchanged = computed(() => this.choice() === this.currentRole);
  protected readonly saveLabel = computed(() =>
    this.promotesToOwner() ? 'Make Owner' : 'Save role',
  );

  protected descriptionIds(choice: RoleChoice): string {
    const description = `${this.idPrefix}-${choice.role}-description`;
    return choice.disabled ? `${description} ${this.idPrefix}-${choice.role}-note` : description;
  }

  protected save(event: Event): void {
    event.preventDefault();
    if (!this.unchanged() && this.connection.allows('setRole')) {
      this.dialogRef.close(this.choice());
    }
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
