import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceInvite } from '../../../../core/models/workspace-invite';
import { WORKSPACE_ROLE_LABELS } from '../../../../core/models/workspace-role';
import { ToastService } from '../../../../core/services/toast.service';
import { InviteState } from '../../../../core/state/invite.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { formatRelative } from '../../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../../shared/ui/input/field/unique-id';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { WorkspaceActions } from '../../workspace-actions.service';
import { inviteExpiryOf } from '../workspace-settings-view';

interface InviteRow {
  readonly invite: WorkspaceInvite;
  readonly roleLabel: string;
  readonly meta: string;
}

@Component({
  selector: 'app-workspace-pending-invites',
  imports: [RouterLink, ButtonComponent, IconComponent, SkeletonComponent, TagComponent],
  templateUrl: './workspace-pending-invites.component.html',
  styleUrl: './workspace-pending-invites.component.scss',
})
export class WorkspacePendingInvitesComponent {
  private readonly invites = inject(InviteState);
  private readonly workspace = inject(WorkspaceState);
  private readonly actions = inject(WorkspaceActions);
  private readonly toasts = inject(ToastService);

  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  protected readonly headingId = createUniqueId('pending-invites');
  protected readonly loading = computed(() => this.invites.status() === 'loading');
  protected readonly count = this.invites.pendingCount;
  protected readonly canInvite = computed(() => this.workspace.access().canInvite);
  protected readonly rows = computed<readonly InviteRow[]>(() => {
    const now = Date.now();
    return this.invites.invites().map((invite) => ({
      invite,
      roleLabel: WORKSPACE_ROLE_LABELS[invite.role],
      meta: `Invited by ${this.inviterOf(invite)} · ${formatRelative(invite.invitedAt, now)} · ${inviteExpiryOf(invite.invitedAt, now)}`,
    }));
  });

  protected invite(): void {
    this.actions.openInvite();
  }

  protected resend(invite: WorkspaceInvite): void {
    void this.invites.resend(invite.id);
    this.toasts.show(`Invitation resent to ${invite.email}`, { icon: 'mail' });
  }

  protected revoke(invite: WorkspaceInvite): void {
    void this.invites.revoke(invite.id);
    this.heading().nativeElement.focus();
    this.toasts.show(`Invitation to ${invite.email} revoked`, {
      icon: 'x',
      actionLabel: 'Undo',
      onAction: () => void this.invites.restore(invite),
    });
  }

  private inviterOf(invite: WorkspaceInvite): string {
    if (invite.invitedById === this.workspace.currentUser()?.id) {
      return 'you';
    }
    return this.workspace.user(invite.invitedById)?.name ?? 'an admin';
  }
}
