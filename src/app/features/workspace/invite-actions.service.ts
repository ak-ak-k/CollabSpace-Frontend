import { inject, Service } from '@angular/core';
import { WorkspaceInvite } from '../../core/models/workspace-invite';
import { ToastService } from '../../core/services/toast.service';
import { InviteState } from '../../core/state/invite.state';

@Service()
export class InviteActions {
  private readonly invites = inject(InviteState);
  private readonly toasts = inject(ToastService);

  resend(invite: WorkspaceInvite): void {
    void this.invites.resend(invite.id);
    this.toasts.show(`Invitation resent to ${invite.email}`, { icon: 'mail' });
  }

  revoke(invite: WorkspaceInvite): void {
    void this.invites.revoke(invite.id);
    this.toasts.show(`Invitation to ${invite.email} revoked`, {
      icon: 'x',
      actionLabel: 'Undo',
      onAction: () => void this.invites.restore(invite),
    });
  }
}
