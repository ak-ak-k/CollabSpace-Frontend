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
import { TASK_COLUMNS } from '../../../core/models/task';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TaskActions } from '../task-actions.service';
import { BoardColumn, TaskBoardComponent } from '../task-board/task-board.component';
import { TaskDrawerComponent, TaskDrawerData } from '../task-drawer/task-drawer.component';
import { TaskMobileBoardComponent } from '../task-mobile-board/task-mobile-board.component';
import { TasksToolbarComponent } from '../tasks-toolbar/tasks-toolbar.component';
import {
  assigneeIdsOf,
  matchesFilters,
  personOf,
  priorityFilterOf,
  sprintKicker,
  TaskPerson,
  taskCardView,
} from '../tasks-view';

@Component({
  selector: 'app-tasks-page',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TaskBoardComponent,
    TaskMobileBoardComponent,
    TasksToolbarComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  private readonly tasks = inject(TaskState);
  private readonly workspace = inject(WorkspaceState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  protected readonly actions = inject(TaskActions);
  protected readonly breakpoint = inject(BreakpointService);

  readonly task = input<string | undefined>(undefined);

  protected readonly kicker = sprintKicker();
  protected readonly query = signal('');
  protected readonly assigneeIds = signal<readonly string[]>([]);
  protected readonly priority = signal<string>('all');
  protected readonly status = this.tasks.status;

  protected readonly people = computed<readonly TaskPerson[]>(() =>
    assigneeIdsOf(this.tasks.tasks())
      .map((id) => personOf(this.workspace.user(id)))
      .filter((person): person is TaskPerson => person !== null),
  );
  private readonly visibleTasks = computed(() => {
    const filters = {
      query: this.query(),
      assigneeIds: this.assigneeIds(),
      priority: priorityFilterOf(this.priority()),
    };
    return this.tasks.tasks().filter((task) => matchesFilters(task, filters));
  });
  protected readonly columns = computed<readonly BoardColumn[]>(() =>
    TASK_COLUMNS.map((column) => ({
      status: column.status,
      label: column.label,
      cards: this.visibleTasks()
        .filter((task) => task.status === column.status)
        .map((task) => taskCardView(task, this.workspace.user(task.assigneeId))),
    })),
  );
  protected readonly visibleCount = computed(() => this.visibleTasks().length);
  protected readonly totalCount = computed(() => this.tasks.tasks().length);
  protected readonly filtered = computed(
    () => this.query().trim() !== '' || this.assigneeIds().length > 0 || this.priority() !== 'all',
  );
  protected readonly noMatch = computed(
    () => this.status() === 'ready' && this.filtered() && this.visibleCount() === 0,
  );

  private drawer: DialogRef<void> | null = null;
  private drawerTaskId: string | null = null;

  constructor() {
    effect(() => {
      const taskId = this.task() ?? null;
      const ready = this.status() !== 'loading';
      untracked(() => this.syncDrawer(taskId, ready));
    });
    inject(DestroyRef).onDestroy(() => this.dismissDrawer());
  }

  protected clearFilters(): void {
    this.query.set('');
    this.assigneeIds.set([]);
    this.priority.set('all');
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
