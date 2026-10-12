import { DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TaskStatus } from '../../../core/models/task';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { DialogService } from '../../../core/services/dialog.service';
import { RouteAccessState } from '../../../core/state/route-access.state';
import { TaskState } from '../../../core/state/task.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { RouteBlockComponent } from '../../system/route-block/route-block.component';
import { TaskActions } from '../task-actions.service';
import { TaskBoardComponent } from '../task-board/task-board.component';
import { TaskDrawerComponent, TaskDrawerData } from '../task-drawer/task-drawer.component';
import { TaskFiltersDialog } from '../task-filters-dialog.service';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskMobileBoardComponent } from '../task-mobile-board/task-mobile-board.component';
import { TasksFilterChipsComponent } from '../tasks-filter-chips/tasks-filter-chips.component';
import { TasksPageStore } from '../tasks-page.store';
import { TasksToolbarComponent } from '../tasks-toolbar/tasks-toolbar.component';

const DRAWER_WIDTH = 'var(--task-drawer-width)';

@Component({
  selector: 'app-tasks-page',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    RouteBlockComponent,
    SkeletonComponent,
    TaskBoardComponent,
    TaskListComponent,
    TaskMobileBoardComponent,
    TasksFilterChipsComponent,
    TasksToolbarComponent,
  ],
  providers: [TasksPageStore],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  private readonly tasks = inject(TaskState);
  private readonly dialogs = inject(DialogService);
  private readonly filtersDialog = inject(TaskFiltersDialog);
  protected readonly store = inject(TasksPageStore);
  protected readonly actions = inject(TaskActions);
  protected readonly breakpoint = inject(BreakpointService);

  readonly taskId = input<string | undefined>(undefined);
  readonly task = input<string | undefined>(undefined);

  protected readonly block = inject(RouteAccessState).taskBlock;
  protected readonly requestedTaskId = computed(() => this.taskId() ?? this.task() ?? null);

  protected readonly filtersOpen = signal(false);
  protected readonly isEmpty = computed(
    () => this.store.status() === 'empty' || this.store.visibleCount() === 0,
  );
  protected readonly isFirstRun = computed(
    () => this.store.status() === 'empty' || !this.store.filtered(),
  );

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private drawer: DialogRef<void> | null = null;
  private drawerTaskId: string | null = null;
  private destroyed = false;

  constructor() {
    effect(() => {
      const taskId = this.requestedTaskId();
      const shown = taskId && this.tasks.task(taskId) && !this.block() ? taskId : null;
      untracked(() => this.syncDrawer(shown));
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.dismissDrawer();
    });
  }

  protected newTask(status?: TaskStatus): void {
    this.actions.newTask({ status, teamId: this.store.createTeamId() });
  }

  protected openFilters(anchor: HTMLElement): void {
    this.filtersOpen.set(true);
    this.filtersDialog
      .open(anchor, {
        filters: this.store.filters,
        teamId: this.store.teamId,
        teamOptions: this.store.teamOptions,
        resultCount: this.store.visibleCount,
        selectTeam: (teamId) => this.actions.showTeam(teamId),
        clearAll: () => this.store.clearAll(),
      })
      .closed.subscribe(() => this.filtersOpen.set(false));
  }

  protected reload(): void {
    void this.tasks.reload();
  }

  private syncDrawer(taskId: string | null): void {
    if (taskId === this.drawerTaskId) {
      return;
    }
    this.dismissDrawer();
    this.drawerTaskId = taskId;
    if (taskId) {
      this.openDrawer(taskId);
    }
  }

  private dismissDrawer(): void {
    const open = this.drawer;
    this.drawer = null;
    open?.close();
  }

  private openDrawer(taskId: string): void {
    const drawer = this.dialogs.openDrawer<void, TaskDrawerData>(TaskDrawerComponent, {
      data: { taskId },
      side: 'right',
      size: 'lg',
      closeOnNavigation: false,
    });
    drawer.updateSize(DRAWER_WIDTH);
    this.drawer = drawer;
    drawer.closed.subscribe(() => {
      if (this.destroyed) {
        return;
      }
      if (this.drawer === drawer) {
        this.drawer = null;
        this.drawerTaskId = null;
        this.actions.close();
      }
      const recover = () => this.recoverFocus();
      afterNextRender(recover, { injector: this.injector });
      setTimeout(recover);
    });
  }

  private recoverFocus(): void {
    const focused = this.document.activeElement;
    if (this.destroyed || this.drawer || (focused && focused !== this.document.body)) {
      return;
    }
    this.title()?.nativeElement.focus();
  }
}
