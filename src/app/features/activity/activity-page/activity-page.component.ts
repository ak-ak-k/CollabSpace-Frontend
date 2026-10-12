import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { LoadStatus } from '../../../core/models/load-status';
import { NetworkState } from '../../../core/state/network.state';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed.component';
import { OfflineNoteComponent } from '../../../shared/components/offline-note/offline-note.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ActivityFiltersComponent } from '../activity-filters/activity-filters.component';
import {
  ACTIVITY_PAGE_SIZE,
  activityCountLabel,
  activityEmptyCopyOf,
  activityFilterOf,
  ActivityPageFilters,
  activityPersonOptions,
  activityTeamOptions,
  DEFAULT_ACTIVITY_FILTERS,
  isActivityFiltered,
} from '../activity-page-view';

@Component({
  selector: 'app-activity-page',
  imports: [
    ActivityFeedComponent,
    ActivityFiltersComponent,
    ButtonComponent,
    EmptyStateComponent,
    OfflineNoteComponent,
    SkeletonComponent,
  ],
  templateUrl: './activity-page.component.html',
  styleUrl: './activity-page.component.scss',
})
export class ActivityPageComponent {
  private readonly activity = inject(WorkspaceActivityState);
  private readonly workspace = inject(WorkspaceState);
  private readonly injector = inject(Injector);

  private readonly filterControls = viewChild(ActivityFiltersComponent);
  private readonly feed = viewChild(ActivityFeedComponent);

  protected readonly offline = inject(NetworkState).offline;
  protected readonly kicker = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'Workspace',
  );
  protected readonly filters = linkedSignal<string, ActivityPageFilters>({
    source: this.workspace.currentWorkspaceId,
    computation: () => DEFAULT_ACTIVITY_FILTERS,
  });
  protected readonly limit = linkedSignal({
    source: this.filters,
    computation: () => ACTIVITY_PAGE_SIZE,
  });

  private readonly loadView = computed<LoadStatus>(() => {
    const statuses = [this.workspace.loadStatus(), this.activity.status()];
    if (statuses.includes('error')) {
      return 'error';
    }
    if (statuses.includes('loading')) {
      return 'loading';
    }
    return this.activity.status();
  });
  private readonly viewerId = computed(() => this.workspace.currentUser()?.id ?? '');
  private readonly allEvents = computed(() => this.activity.events({ category: 'activity' }));
  private readonly matching = computed(() =>
    this.activity.events(activityFilterOf(this.filters(), this.viewerId(), Date.now())),
  );

  protected readonly view = computed<LoadStatus>(() =>
    this.loadView() === 'ready' && this.matching().length === 0 ? 'empty' : this.loadView(),
  );
  protected readonly rows = computed(() =>
    this.activity.toRows(this.matching().slice(0, this.limit())),
  );
  protected readonly hasMore = computed(() => this.matching().length > this.limit());
  protected readonly countLabel = computed(() =>
    this.loadView() === 'ready' ? activityCountLabel(this.limit(), this.matching().length) : '',
  );
  protected readonly teamOptions = computed(() => activityTeamOptions(this.workspace.teams()));
  protected readonly personOptions = computed(() =>
    activityPersonOptions(
      this.allEvents(),
      this.viewerId(),
      (userId) => this.workspace.user(userId)?.name ?? null,
    ),
  );
  protected readonly emptyCopy = computed(() =>
    activityEmptyCopyOf(this.loadView() === 'ready' && isActivityFiltered(this.filters())),
  );

  protected loadMore(): void {
    const firstNewRow = this.limit();
    this.limit.update((limit) => limit + ACTIVITY_PAGE_SIZE);
    afterNextRender(() => this.feed()?.focusRow(firstNewRow), { injector: this.injector });
  }

  protected clearFilters(): void {
    this.filters.set(DEFAULT_ACTIVITY_FILTERS);
    afterNextRender(() => this.filterControls()?.focus(), { injector: this.injector });
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.activity.reload();
  }
}
