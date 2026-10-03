import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DOCUMENT, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { TASK_COLUMNS, TASK_STATUS_LABELS, TaskStatus } from '../../core/models/task';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { TaskState } from '../../core/state/task.state';
import { TaskDialogComponent, TaskDialogData } from './task-dialog/task-dialog.component';
import { nextTaskIdInColumn } from './tasks-view';

export const TASK_QUERY_PARAM = 'task';

@Service()
export class TaskActions {
  private readonly tasks = inject(TaskState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  newTask(status?: TaskStatus): void {
    this.dialogs.open<string, TaskDialogData>(TaskDialogComponent, {
      size: 'lg',
      data: { status },
    });
  }

  open(taskId: string): void {
    void this.router.navigate(['/tasks'], { queryParams: { [TASK_QUERY_PARAM]: taskId } });
  }

  close(): void {
    void this.router.navigate(['/tasks']);
  }

  async move(taskId: string, status: TaskStatus, beforeId?: string): Promise<void> {
    const task = this.tasks.task(taskId);
    if (!task) {
      return;
    }
    const previousStatus = task.status;
    const previousBeforeId = nextTaskIdInColumn(this.tasks.tasks(), taskId);
    await this.tasks.move(taskId, status, beforeId);
    if (previousStatus === status) {
      void this.announcer.announce(`${taskId} reordered in ${TASK_STATUS_LABELS[status]}`);
      return;
    }
    this.toasts.show(`${taskId} moved to ${TASK_STATUS_LABELS[status]}`, {
      icon: 'arrow-right',
      actionLabel: 'Undo',
      onAction: () => void this.tasks.move(taskId, previousStatus, previousBeforeId),
    });
  }

  async moveByStep(taskId: string, step: -1 | 1): Promise<void> {
    const status = this.tasks.task(taskId)?.status;
    const index = TASK_COLUMNS.findIndex((column) => column.status === status);
    const target = TASK_COLUMNS[index + step];
    if (!target) {
      const edge = step < 0 ? 'first' : 'last';
      void this.announcer.announce(`${taskId} is already in the ${edge} column`);
      return;
    }
    await this.move(taskId, target.status);
  }

  async copyLink(taskId: string): Promise<void> {
    const url = `${this.document.location.origin}/tasks?${TASK_QUERY_PARAM}=${taskId}`;
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
    if (confirmed) {
      await this.tasks.remove(taskId);
      this.toasts.show(`${taskId} deleted`, { icon: 'trash-2' });
    }
    return confirmed;
  }
}
