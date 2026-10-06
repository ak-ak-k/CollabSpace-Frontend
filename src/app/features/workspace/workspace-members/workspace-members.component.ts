import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { InviteState } from '../../../core/state/invite.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { CountPipe } from '../../../shared/pipes/count.pipe';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { MemberCardsComponent } from '../member-cards/member-cards.component';
import { invitesMatching } from '../invites-view';
import { MembersTableComponent } from '../members-table/members-table.component';
import {
  allowedMemberFilter,
  MANAGE_INVITATIONS_ROUTE,
  MemberFilter,
  memberFilterChips,
  memberFilterOf,
  memberRowOf,
  noMatchingMembers,
  showingLabel,
  visibleMembers,
  workspacePeople,
} from '../members-view';
import { PendingInviteListComponent } from '../pending-invite-list/pending-invite-list.component';
import { WorkspaceActions } from '../workspace-actions.service';

type MembersView = 'loading' | 'error' | 'solo' | 'none' | 'list' | 'invited';

@Component({
  selector: 'app-workspace-members',
  imports: [
    ButtonComponent,
    CountPipe,
    EmptyStateComponent,
    IconComponent,
    MemberCardsComponent,
    MembersTableComponent,
    PendingInviteListComponent,
    RouterLink,
    SearchInputComponent,
    SkeletonComponent,
  ],
  templateUrl: './workspace-members.component.html',
  styleUrl: './workspace-members.component.scss',
})
export class WorkspaceMembersComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly invites = inject(InviteState);
  private readonly breakpoint = inject(BreakpointService);
  private readonly workspaceActions = inject(WorkspaceActions);

  readonly filter = input<MemberFilter, string | undefined>('all', {
    transform: memberFilterOf,
  });

  protected readonly manageInvitationsRoute = MANAGE_INVITATIONS_ROUTE;
  protected readonly query = signal('');
  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly isDesktop = this.breakpoint.isDesktop;
  protected readonly access = this.workspace.access;
  protected readonly pendingCount = this.invites.pendingCount;

  private readonly loadStatus = this.workspace.loadStatus;
  protected readonly ready = computed(
    () => this.loadStatus() === 'ready' || this.loadStatus() === 'empty',
  );
  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );
  private readonly people = computed(() =>
    workspacePeople(
      this.workspace.memberDirectory(),
      this.workspace.currentUser(),
      this.loadStatus(),
    ),
  );
  protected readonly shownFilter = computed(() =>
    allowedMemberFilter(this.filter(), this.access().canInvite),
  );
  private readonly peopleFilter = computed(() => {
    const filter = this.shownFilter();
    return filter === 'invited' ? 'all' : filter;
  });
  protected readonly chips = computed(() =>
    memberFilterChips(this.people(), this.access().canInvite ? this.pendingCount() : undefined),
  );
  protected readonly matchingInvites = computed(() =>
    invitesMatching(this.invites.invites(), this.query()),
  );
  protected readonly rows = computed(() => {
    const viewerId = this.workspace.currentUser()?.id ?? '';
    return visibleMembers(this.people(), this.peopleFilter(), this.query()).map((user) =>
      memberRowOf(user, viewerId),
    );
  });
  private readonly invitesStatus = computed(() =>
    this.shownFilter() === 'invited' ? this.invites.status() : 'ready',
  );
  protected readonly view = computed<MembersView>(() => {
    const statuses = [this.loadStatus(), this.invitesStatus()];
    if (statuses.includes('error')) {
      return 'error';
    }
    if (statuses.includes('loading')) {
      return 'loading';
    }
    if (this.shownFilter() === 'invited') {
      return 'invited';
    }
    if (this.people().length <= 1) {
      return 'solo';
    }
    return this.rows().length === 0 ? 'none' : 'list';
  });
  protected readonly showPending = computed(
    () => this.ready() && this.access().canManage && this.pendingCount() > 0,
  );
  protected readonly noMatch = computed(() =>
    noMatchingMembers(this.peopleFilter(), this.query(), this.workspaceName()),
  );
  protected readonly soloMessage = computed(() =>
    this.access().canInvite
      ? `Invite teammates to start working together in ${this.workspaceName()}.`
      : `When people join ${this.workspaceName()}, they’ll appear here.`,
  );
  protected readonly caption = computed(() => `Members of ${this.workspaceName()}, sorted by name`);
  protected readonly countLabel = computed(() =>
    showingLabel(this.rows().length, this.people().length),
  );

  protected invite(): void {
    this.workspaceActions.openInvite();
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.invites.reload();
  }
}
