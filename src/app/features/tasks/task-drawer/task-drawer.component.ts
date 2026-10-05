import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { TASK_STATUS_LABELS } from '../../../core/models/task';
import { TaskState } from '../../../core/state/task.state';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TaskActions } from '../task-actions.service';
import { TaskAttachmentsComponent } from '../task-attachments/task-attachments.component';
import { TaskCommentsComponent } from '../task-comments/task-comments.component';
import { TaskEditorComponent } from '../task-editor/task-editor.component';
import { TaskHistoryComponent } from '../task-history/task-history.component';
import { TaskSubtasksComponent } from '../task-subtasks/task-subtasks.component';

export interface TaskDrawerData {
  readonly taskId: string;
}

@Component({
  selector: 'app-task-drawer',
  imports: [
    IconButtonComponent,
    IconComponent,
    TagComponent,
    TaskAttachmentsComponent,
    TaskCommentsComponent,
    TaskEditorComponent,
    TaskHistoryComponent,
    TaskSubtasksComponent,
  ],
  templateUrl: './task-drawer.component.html',
  styleUrl: './task-drawer.component.scss',
})
export class TaskDrawerComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly taskId = inject<TaskDrawerData>(DIALOG_DATA).taskId;
  private readonly tasks = inject(TaskState);
  protected readonly actions = inject(TaskActions);

  protected readonly titleId = createUniqueId('task-title');
  protected readonly task = computed(() => this.tasks.task(this.taskId));
  protected readonly statusLabel = computed(() => {
    const task = this.task();
    return task ? TASK_STATUS_LABELS[task.status] : '';
  });

  constructor() {
    labelEnclosingDialog(this.titleId);
    effect(() => {
      if (this.task() === null && this.tasks.status() !== 'loading') {
        untracked(() => this.close());
      }
    });
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected async remove(): Promise<void> {
    if (await this.actions.remove(this.taskId)) {
      this.close();
    }
  }
}
