import { Component, computed, inject, input, signal } from '@angular/core';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import {
  ALL_DEPARTMENTS,
  ALL_TEAMS,
  PeopleStatusFilter,
  peopleStatusFilterOf,
} from '../../../core/state/people-view';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { WorkspaceActions } from '../../workspace/workspace-actions.service';
import { PeopleActions } from '../people-actions.service';
import { createPeopleDirectory } from '../people-directory';
import { PeopleFilterBarComponent } from '../people-filter-bar/people-filter-bar.component';
import { ActiveFilterKind, PeopleLayout, peopleCount } from '../people-page-view';
import { PeopleToolbarComponent } from '../people-toolbar/people-toolbar.component';
import { PersonCardComponent } from '../person-card/person-card.component';
import { PersonRowComponent } from '../person-row/person-row.component';

type PeopleView = 'loading' | 'error' | 'solo' | 'none' | 'grid' | 'list';

@Component({
  selector: 'app-people-page',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    PeopleFilterBarComponent,
    PeopleToolbarComponent,
    PersonCardComponent,
    PersonRowComponent,
    SkeletonComponent,
  ],
  templateUrl: './people-page.component.html',
  styleUrl: './people-page.component.scss',
})
export class PeoplePageComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly workspaceActions = inject(WorkspaceActions);
  private readonly actions = inject(PeopleActions);
  private readonly breakpoint = inject(BreakpointService);

  readonly filter = input<PeopleStatusFilter, string | undefined>('all', {
    transform: peopleStatusFilterOf,
  });

  protected readonly query = signal('');
  protected readonly teamId = signal(ALL_TEAMS);
  protected readonly department = signal(ALL_DEPARTMENTS);
  protected readonly layout = signal<PeopleLayout>('grid');
  protected readonly filtersOpen = signal(false);

  protected readonly directory = createPeopleDirectory({
    workspace: this.workspace,
    query: this.query,
    status: this.filter,
    teamId: this.teamId,
    department: this.department,
  });

  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly isDesktop = this.breakpoint.isDesktop;
  protected readonly canInvite = computed(() => this.workspace.access().canInvite);
  protected readonly grid = computed(() => !this.isMobile() && this.layout() === 'grid');
  protected readonly view = computed<PeopleView>(() => {
    const status = this.workspace.loadStatus();
    if (status === 'loading' || status === 'error') {
      return status;
    }
    if (this.directory.everyone().length <= 1) {
      return 'solo';
    }
    if (this.directory.rows().length === 0) {
      return 'none';
    }
    return this.grid() ? 'grid' : 'list';
  });
  protected readonly ready = computed(() => !['loading', 'error'].includes(this.view()));
  protected readonly listLabel = computed(() => `People in ${this.directory.workspaceName()}`);
  protected readonly countLabel = computed(
    () =>
      `Showing ${this.directory.rows().length} of ${peopleCount(this.directory.everyone().length)}`,
  );
  protected readonly soloMessage = computed(() =>
    this.canInvite()
      ? `Invite teammates to ${this.directory.workspaceName()} and they’ll show up here.`
      : `When people join ${this.directory.workspaceName()}, they’ll show up here.`,
  );

  protected invite(): void {
    this.workspaceActions.openInvite();
  }

  protected retry(): void {
    void this.workspace.reload();
  }

  protected removeFilter(kind: ActiveFilterKind): void {
    if (kind === 'team') {
      this.teamId.set(ALL_TEAMS);
    } else {
      this.department.set(ALL_DEPARTMENTS);
    }
  }

  protected clearFilters(): void {
    this.teamId.set(ALL_TEAMS);
    this.department.set(ALL_DEPARTMENTS);
  }

  protected runEmptyAction(): void {
    if (this.directory.empty().action === 'clear-search') {
      this.query.set('');
    } else {
      this.clearFilters();
    }
  }

  protected openFilters(): void {
    this.filtersOpen.set(true);
    const sheet = this.actions.openFilters({
      teamId: this.teamId,
      department: this.department,
      teamOptions: this.directory.teamOptions,
      departmentOptions: this.directory.departmentOptions,
      resultCount: computed(() => this.directory.rows().length),
    });
    sheet.closed.subscribe(() => this.filtersOpen.set(false));
  }
}
