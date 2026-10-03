import { Component, computed, inject } from '@angular/core';
import { LoadStatus } from '../../../core/models/load-status';
import { InviteState } from '../../../core/state/invite.state';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { workspacePeople } from '../members-view';
import { OverviewActivityComponent } from '../overview-activity/overview-activity.component';
import { OverviewStatsComponent } from '../overview-stats/overview-stats.component';
import { OverviewTeamsComponent } from '../overview-teams/overview-teams.component';
import { WorkspaceActions } from '../workspace-actions.service';
import {
  overviewActivityItem,
  overviewStats,
  overviewTeamRow,
  workspaceDetails,
} from './overview-view';

@Component({
  selector: 'app-workspace-overview',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    OverviewActivityComponent,
    OverviewStatsComponent,
    OverviewTeamsComponent,
    SectionHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './workspace-overview.component.html',
  styleUrl: './workspace-overview.component.scss',
})
export class WorkspaceOverviewComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly activityState = inject(WorkspaceActivityState);
  private readonly invites = inject(InviteState);
  protected readonly actions = inject(WorkspaceActions);

  protected readonly access = this.workspace.access;
  private readonly viewerId = computed(() => this.workspace.currentUser()?.id ?? '');

  protected readonly status = computed<LoadStatus>(() => {
    const statuses = [this.workspace.loadStatus(), this.activityState.status()];
    if (statuses.includes('error')) {
      return 'error';
    }
    return statuses.includes('loading') ? 'loading' : 'ready';
  });

  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );
  protected readonly stats = computed(() =>
    overviewStats({
      people: workspacePeople(
        this.workspace.members(),
        this.workspace.currentUser(),
        this.workspace.loadStatus(),
      ),
      pendingInvites: this.invites.pendingCount(),
      teams: this.workspace.teams(),
      channels: this.workspace.channels(),
    }),
  );
  protected readonly activity = computed(() => {
    const usersById = this.workspace.usersById();
    return this.activityState
      .events()
      .map((event) => overviewActivityItem(event, usersById, this.viewerId()));
  });
  protected readonly teams = computed(() => this.workspace.teams().map(overviewTeamRow));
  protected readonly details = computed(() => {
    const current = this.workspace.currentWorkspace();
    if (!current) {
      return [];
    }
    const owner = this.workspace.user(current.ownerId);
    return workspaceDetails(current, owner, this.viewerId(), this.access().myRole);
  });
  protected readonly locked = computed(
    () => !this.access().canInvite && !this.access().canCreateTeams,
  );

  protected retry(): void {
    void this.workspace.reload();
    void this.activityState.reload();
    void this.invites.reload();
  }
}
