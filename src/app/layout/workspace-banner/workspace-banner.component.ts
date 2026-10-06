import { formatDate } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, output } from '@angular/core';
import { Workspace } from '../../core/models/workspace';
import { ToastService } from '../../core/services/toast.service';
import { WorkspaceAdminState } from '../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconName } from '../../shared/ui/icon/icon-registry';

type WorkspaceBannerAction = 'cancel-deletion' | 'unarchive';

interface WorkspaceBannerView {
  readonly icon: IconName;
  readonly message: string;
  readonly action: WorkspaceBannerAction;
  readonly actionLabel: string;
}

const DELETION_DAY_FORMAT = 'd MMMM';

@Component({
  selector: 'app-workspace-banner',
  imports: [IconComponent],
  templateUrl: './workspace-banner.component.html',
  styleUrl: './workspace-banner.component.scss',
  host: { role: 'status' },
})
export class WorkspaceBannerComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly toasts = inject(ToastService);
  private readonly locale = inject(LOCALE_ID);

  readonly resolved = output<void>();

  protected readonly canAct = computed(() => this.workspace.access().isOwner);
  protected readonly banner = computed(() => {
    const current = this.workspace.currentWorkspace();
    return current ? this.bannerFor(current) : null;
  });

  protected act(action: WorkspaceBannerAction): void {
    if (action === 'cancel-deletion') {
      this.cancelDeletion();
    } else {
      this.unarchive();
    }
    this.resolved.emit();
  }

  private bannerFor(workspace: Workspace): WorkspaceBannerView | null {
    if (workspace.deleteAt) {
      const day = formatDate(workspace.deleteAt, DELETION_DAY_FORMAT, this.locale);
      return {
        icon: 'trash-2',
        message: `${workspace.name} is scheduled for deletion on ${day}.`,
        action: 'cancel-deletion',
        actionLabel: 'Cancel deletion',
      };
    }
    if (workspace.archivedAt) {
      return {
        icon: 'archive',
        message: `${workspace.name} is archived — it’s read-only until an owner unarchives it.`,
        action: 'unarchive',
        actionLabel: 'Unarchive',
      };
    }
    return null;
  }

  private cancelDeletion(): void {
    void this.admin.scheduleDeletion(false);
    this.toasts.show('Deletion cancelled', { icon: 'rotate-ccw' });
  }

  private unarchive(): void {
    const name = this.workspace.currentWorkspace()?.name ?? 'The workspace';
    void this.admin.setArchived(false);
    this.toasts.show(`${name} is active again`, { icon: 'archive-restore' });
  }
}
