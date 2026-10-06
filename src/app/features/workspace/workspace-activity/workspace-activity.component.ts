import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import {
  ACTIVITY_PAGE_SIZE,
  activityDayGroupsOf,
  activityEmptyCopyOf,
  ActivityFeedFilters,
  activityFilterOf,
  activityTeamOptions,
  DEFAULT_ACTIVITY_FEED_FILTERS,
  isActivityFiltered,
} from './activity-feed-view';
import { WorkspaceActivityFiltersComponent } from './workspace-activity-filters/workspace-activity-filters.component';

@Component({
  selector: 'app-workspace-activity',
  imports: [
    AvatarComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
    SkeletonComponent,
    WorkspaceActivityFiltersComponent,
  ],
  templateUrl: './workspace-activity.component.html',
  styleUrl: './workspace-activity.component.scss',
})
export class WorkspaceActivityComponent {
  private readonly activity = inject(WorkspaceActivityState);
  private readonly workspace = inject(WorkspaceState);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly filterControls = viewChild.required(WorkspaceActivityFiltersComponent);
  private readonly entries = viewChildren<ElementRef<HTMLElement>>('entry');

  protected readonly filters = linkedSignal<string, ActivityFeedFilters>({
    source: this.workspace.currentWorkspaceId,
    computation: () => DEFAULT_ACTIVITY_FEED_FILTERS,
  });
  protected readonly limit = linkedSignal({
    source: this.filters,
    computation: () => ACTIVITY_PAGE_SIZE,
  });

  protected readonly status = computed<LoadStatus>(() => {
    const statuses = [this.workspace.loadStatus(), this.activity.status()];
    if (statuses.includes('error')) {
      return 'error';
    }
    return statuses.includes('loading') ? 'loading' : 'ready';
  });

  private readonly viewerId = computed(() => this.workspace.currentUser()?.id ?? '');
  private readonly teamNames = computed(
    () => new Map(this.workspace.teams().map((team) => [team.id, team.name])),
  );
  private readonly matching = computed(() =>
    this.activity.events(activityFilterOf(this.filters(), this.viewerId(), Date.now())),
  );

  protected readonly teamOptions = computed(() => activityTeamOptions(this.workspace.teams()));
  protected readonly groups = computed(() => {
    const teamNames = this.teamNames();
    return activityDayGroupsOf(this.matching().slice(0, this.limit()), {
      usersById: this.workspace.usersById(),
      viewerId: this.viewerId(),
      teamNameOf: (teamId) => teamNames.get(teamId) ?? null,
      now: Date.now(),
    });
  });
  protected readonly hasMore = computed(() => this.matching().length > this.limit());
  protected readonly emptyCopy = computed(() =>
    activityEmptyCopyOf(isActivityFiltered(this.filters())),
  );

  protected linkTo(route: string): UrlTree {
    return this.router.parseUrl(route);
  }

  protected loadMore(): void {
    const firstNewEntry = this.limit();
    this.limit.update((limit) => limit + ACTIVITY_PAGE_SIZE);
    afterNextRender(() => this.entries()[firstNewEntry]?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected clearFilters(): void {
    this.filters.set(DEFAULT_ACTIVITY_FEED_FILTERS);
    afterNextRender(() => this.filterControls().focus(), { injector: this.injector });
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.activity.reload();
  }
}
