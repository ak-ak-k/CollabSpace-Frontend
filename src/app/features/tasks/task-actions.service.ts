import { computed, DOCUMENT, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { TASK_COLUMNS, TASK_STATUS_LABELS, TaskStatus } from '../../core/models/task';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { TaskState } from '../../core/state/task.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { TaskDialogComponent, TaskDialogData } from './task-dialog/task-dialog.component';
import { TaskLayout } from './tasks-filters';
import { nextTaskIdInColumn } from './tasks-view';

export const TASK_QUERY_PARAM = 'task';
export const TEAM_QUERY_PARAM = 'team';
export const VIEW_QUERY_PARAM = 'view';
const TASKS_PATH = '/tasks';

@Service()
export class TaskActions {
  private readonly tasks = inject(TaskState);
  private readonly workspace = inject(WorkspaceState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly canCreate = computed(() => this.workspace.access().myRole !== 'guest');
  readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );

  newTask(data: TaskDialogData = {}): void {
    if (!this.canCreate()) {
      this.toasts.show(`Guests can’t create tasks in ${this.workspaceName()}`, { icon: 'lock' });
      return;
    }
    this.dialogs.open<string, TaskDialogData>(TaskDialogComponent, { size: 'lg', data });
  }

  open(taskId: string): void {
    this.navigate({ [TASK_QUERY_PARAM]: taskId });
  }

  close(): void {
    this.navigate({ [TASK_QUERY_PARAM]: null });
  }

  showLayout(layout: TaskLayout): void {
    this.navigate({ [VIEW_QUERY_PARAM]: layout === 'list' ? 'list' : null });
  }

  showTeam(teamId: string): void {
    this.navigate({ [TEAM_QUERY_PARAM]: teamId || null });
  }

  async move(taskId: string, status: TaskStatus, beforeId?: string): Promise<void> {
    const task = this.tasks.task(taskId);
    if (!task) {
      return;
    }
    const previousStatus = task.status;
    const previousBeforeId = nextTaskIdInColumn(this.tasks.tasks(), taskId);
    await this.tasks.move(taskId, status, beforeId);
    if (previousStatus !== status) {
      this.toasts.show(`${taskId} moved to ${TASK_STATUS_LABELS[status]}`, {
        icon: 'arrow-right',
        actionLabel: 'Undo',
        onAction: () => void this.tasks.move(taskId, previousStatus, previousBeforeId),
      });
    }
  }

  async moveByStep(taskId: string, step: -1 | 1): Promise<void> {
    const status = this.tasks.task(taskId)?.status;
    const index = TASK_COLUMNS.findIndex((column) => column.status === status);
    const target = TASK_COLUMNS[index + step];
    if (target) {
      await this.move(taskId, target.status);
    }
  }

  async copyLink(taskId: string): Promise<void> {
    const url = `${this.document.location.origin}${TASKS_PATH}?${TASK_QUERY_PARAM}=${taskId}`;
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(url);
      this.toasts.show(`Link to ${taskId} copied`, { icon: 'link' });
    } catch {
      this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
        icon: 'circle-alert',
      });
    }
  }

  async remove(taskId: string): Promise<boolean> {
    const confirmed = await this.dialogs.confirm({
      title: `Delete ${taskId}?`,
      body: 'The task, its comments and attachments will be removed from the board.',
      confirmLabel: 'Delete task',
      icon: 'trash-2',
    });
    if (!confirmed) {
      return false;
    }
    const removed = await this.tasks.remove(taskId);
    this.close();
    if (removed) {
      this.toasts.show(`${taskId} deleted`, {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => void this.tasks.restore(removed),
      });
    }
    return true;
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([TASKS_PATH], { queryParams, queryParamsHandling: 'merge' });
  }
}
