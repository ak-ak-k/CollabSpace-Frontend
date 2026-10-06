import { Component, computed, inject } from '@angular/core';
import { DialogService } from '../../../../core/services/dialog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceAdminState } from '../../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { formatCount } from '../../../../shared/pipes/count.pipe';
import { formatDate } from '../../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { DangerZoneComponent } from '../../../settings/danger-zone/danger-zone.component';
import { WorkspaceSettingsNoteComponent } from '../workspace-settings-note/workspace-settings-note.component';
import { ownerOnlyNoteOf } from '../workspace-settings-view';
import { WorkspaceTransferOwnershipComponent } from '../workspace-transfer-ownership/workspace-transfer-ownership.component';

@Component({
  selector: 'app-workspace-settings-danger',
  imports: [
    ButtonComponent,
    DangerZoneComponent,
    IconComponent,
    WorkspaceSettingsNoteComponent,
    WorkspaceTransferOwnershipComponent,
  ],
  templateUrl: './workspace-settings-danger.component.html',
  styleUrl: './workspace-settings-danger.component.scss',
})
export class WorkspaceSettingsDangerComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);

  private readonly name = computed(() => this.workspace.currentWorkspace()?.name ?? '');
  private readonly memberCount = computed(() => this.workspace.members().length);
  private readonly deleteAt = computed(() => this.workspace.currentWorkspace()?.deleteAt ?? null);

  protected readonly isOwner = computed(() => this.workspace.access().isOwner);
  protected readonly ownerNote = computed(() => ownerOnlyNoteOf(this.name()));
  protected readonly archived = this.workspace.isArchived;
  protected readonly deleting = computed(() => this.deleteAt() !== null);
  protected readonly archiveHeading = computed(() =>
    this.archived() ? 'Workspace archived' : 'Archive workspace',
  );
  protected readonly archiveText = computed(() =>
    this.archived()
      ? `${this.name()} is read-only. Unarchive it to let people post, upload files and create teams again.`
      : `Make ${this.name()} read-only. Everyone keeps access to what’s there, and you can unarchive it any time.`,
  );
  protected readonly deleteText = computed(() => {
    const deleteAt = this.deleteAt();
    return deleteAt === null
      ? `Permanently delete all teams, channels, messages, tasks and files for ${formatCount(this.memberCount(), 'member')} after a 14-day grace period.`
      : `Scheduled for deletion on ${formatDate(deleteAt, { day: 'numeric', month: 'long' })}. Everything will be permanently deleted then unless an owner cancels.`;
  });

  protected async archive(): Promise<void> {
    const name = this.name();
    const confirmed = await this.dialogs.confirm({
      tone: 'neutral',
      icon: 'archive',
      title: `Archive ${name}?`,
      body: 'Everyone keeps read access, but nobody can post, upload files or create teams until an owner unarchives it.',
      confirmLabel: 'Archive workspace',
    });
    if (!confirmed) {
      return;
    }
    void this.admin.setArchived(true);
    this.toasts.show(`${name} archived — it’s now read-only`, {
      icon: 'archive',
      actionLabel: 'Undo',
      onAction: () => void this.admin.setArchived(false),
    });
  }

  protected unarchive(): void {
    void this.admin.setArchived(false);
    this.toasts.show(`${this.name()} is active again`, { icon: 'archive-restore' });
  }

  protected async scheduleDeletion(): Promise<void> {
    const name = this.name();
    const confirmed = await this.dialogs.confirm({
      icon: 'trash-2',
      title: `Delete ${name}?`,
      body: `All teams, channels, messages, tasks and files for ${this.memberCount()} members will be permanently deleted after 14 days. Owners can cancel until then.`,
      confirmLabel: 'Delete workspace',
      confirmText: name,
    });
    if (!confirmed) {
      return;
    }
    void this.admin.scheduleDeletion(true);
    this.toasts.show(`Deletion scheduled — ${name} will be deleted in 14 days`, {
      icon: 'trash-2',
      actionLabel: 'Undo',
      onAction: () => void this.admin.scheduleDeletion(false),
    });
  }

  protected cancelDeletion(): void {
    void this.admin.scheduleDeletion(false);
    this.toasts.show('Deletion cancelled', { icon: 'rotate-ccw' });
  }
}
