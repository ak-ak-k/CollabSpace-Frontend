import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceInvite } from '../../../../core/models/workspace-invite';
import { WORKSPACE_ROLE_LABELS } from '../../../../core/models/workspace-role';
import { InviteState } from '../../../../core/state/invite.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { formatRelative } from '../../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../../shared/ui/input/field/unique-id';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { InviteActions } from '../../invite-actions.service';
import { inviterLabelOf } from '../../invites-view';
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
  private readonly inviteActions = inject(InviteActions);

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
    this.inviteActions.resend(invite);
  }

  protected revoke(invite: WorkspaceInvite): void {
    this.inviteActions.revoke(invite);
    this.heading().nativeElement.focus();
  }

  private inviterOf(invite: WorkspaceInvite): string {
    return inviterLabelOf(
      invite.invitedById,
      this.workspace.currentUser()?.id ?? null,
      (userId) => this.workspace.user(userId)?.name ?? null,
    );
  }
}
