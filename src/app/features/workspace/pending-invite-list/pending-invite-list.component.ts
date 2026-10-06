import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  viewChildren,
} from '@angular/core';
import { WorkspaceInvite } from '../../../core/models/workspace-invite';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { InviteActions } from '../invite-actions.service';
import {
  inviterLabelOf,
  PendingInviteRow,
  pendingInviteRowOf,
  pendingInvitesEmptyOf,
} from '../invites-view';

type InviteButtonRefs = readonly ElementRef<HTMLElement>[];

@Component({
  selector: 'app-pending-invite-list',
  imports: [ButtonComponent, EmptyStateComponent, IconComponent, TagComponent],
  templateUrl: './pending-invite-list.component.html',
  styleUrl: './pending-invite-list.component.scss',
  host: { tabindex: '-1' },
})
export class PendingInviteListComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly inviteActions = inject(InviteActions);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly invites = input.required<readonly WorkspaceInvite[]>();
  readonly query = input('');

  private readonly resendButtons = viewChildren<string, ElementRef<HTMLElement>>('resendButton', {
    read: ElementRef,
  });
  private readonly revokeButtons = viewChildren<string, ElementRef<HTMLElement>>('revokeButton', {
    read: ElementRef,
  });

  protected readonly emptyView = computed(() => pendingInvitesEmptyOf(this.query()));
  protected readonly rows = computed<readonly PendingInviteRow[]>(() => {
    const now = Date.now();
    const viewerId = this.workspace.currentUser()?.id ?? null;
    const nameOf = (userId: string) => this.workspace.user(userId)?.name ?? null;
    return this.invites().map((invite) =>
      pendingInviteRowOf(invite, inviterLabelOf(invite.invitedById, viewerId, nameOf), now),
    );
  });

  protected resend(row: PendingInviteRow): void {
    this.inviteActions.resend(row.invite);
    this.focusAfterRender(() => {
      const index = this.rows().findIndex((candidate) => candidate.invite.id === row.invite.id);
      return this.buttonAt(this.resendButtons(), index);
    });
  }

  protected revoke(row: PendingInviteRow, index: number): void {
    this.inviteActions.revoke(row.invite);
    this.focusAfterRender(() => {
      const buttons = this.revokeButtons();
      return this.buttonAt(buttons, Math.min(index, buttons.length - 1));
    });
  }

  private buttonAt(buttons: InviteButtonRefs, index: number): HTMLElement | null {
    return index < 0 ? null : (buttons[index]?.nativeElement ?? null);
  }

  private focusAfterRender(targetOf: () => HTMLElement | null): void {
    afterNextRender(() => (targetOf() ?? this.host.nativeElement).focus(), {
      injector: this.injector,
    });
  }
}
