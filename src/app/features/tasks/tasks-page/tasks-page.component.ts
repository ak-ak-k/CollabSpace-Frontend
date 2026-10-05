import { DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { TaskStatus } from '../../../core/models/task';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { TaskState } from '../../../core/state/task.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
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
  private readonly toasts = inject(ToastService);
  private readonly filtersDialog = inject(TaskFiltersDialog);
  protected readonly store = inject(TasksPageStore);
  protected readonly actions = inject(TaskActions);
  protected readonly breakpoint = inject(BreakpointService);

  readonly task = input<string | undefined>(undefined);

  protected readonly filtersOpen = signal(false);
  protected readonly isEmpty = computed(
    () => this.store.status() === 'empty' || this.store.visibleCount() === 0,
  );
  protected readonly isFirstRun = computed(
    () => this.store.status() === 'empty' || !this.store.filtered(),
  );

  private drawer: DialogRef<void> | null = null;
  private drawerTaskId: string | null = null;

  constructor() {
    effect(() => {
      const taskId = this.task() ?? null;
      const ready = this.tasks.status() !== 'loading';
      untracked(() => this.syncDrawer(taskId, ready));
    });
    inject(DestroyRef).onDestroy(() => this.dismissDrawer());
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

  private syncDrawer(taskId: string | null, ready: boolean): void {
    if (taskId === this.drawerTaskId || !ready) {
      return;
    }
    this.dismissDrawer();
    this.drawerTaskId = taskId;
    if (!taskId) {
      return;
    }
    if (!this.tasks.task(taskId)) {
      this.toasts.show(`Task ${taskId} wasn’t found`, { icon: 'circle-alert' });
      this.actions.close();
      return;
    }
    this.openDrawer(taskId);
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
    });
    drawer.updateSize(DRAWER_WIDTH);
    this.drawer = drawer;
    drawer.closed.subscribe(() => {
      if (this.drawer === drawer) {
        this.drawer = null;
        this.drawerTaskId = null;
        this.actions.close();
      }
    });
  }
}
