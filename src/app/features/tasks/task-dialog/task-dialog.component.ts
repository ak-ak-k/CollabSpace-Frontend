import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import {
  TASK_COLUMNS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskPriority,
  TaskStatus,
} from '../../../core/models/task';
import { ToastService } from '../../../core/services/toast.service';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

export interface TaskDialogData {
  readonly status?: TaskStatus;
}

interface TaskDraft {
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly assigneeId: string;
  readonly dueDate: string;
  readonly priority: string;
}

const DEFAULT_DUE_IN_DAYS = 3;
const DATE_INPUT_LENGTH = 10;
const MILLISECONDS_PER_DAY = 86_400_000;

const dateInputValue = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, DATE_INPUT_LENGTH);

const timestampOf = (dateInput: string): number =>
  new Date(`${dateInput}T00:00`).getTime() || Date.now();

@Component({
  selector: 'app-task-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    RadioGroupComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent {
  private readonly dialogRef = inject<DialogRef<string>>(DialogRef);
  private readonly data = inject<TaskDialogData | null>(DIALOG_DATA, { optional: true });
  private readonly tasks = inject(TaskState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly statusOptions: readonly SelectOption[] = TASK_COLUMNS.map((column) => ({
    value: column.status,
    label: column.label,
  }));
  protected readonly priorityOptions: readonly RadioOption[] = TASK_PRIORITIES.map((priority) => ({
    value: priority,
    label: TASK_PRIORITY_LABELS[priority],
  }));
  protected readonly assigneeOptions = computed<readonly SelectOption[]>(() =>
    this.workspace.users().map((user) => ({
      value: user.id,
      label: user.id === CURRENT_USER_ID ? `${user.name} (you)` : user.name,
    })),
  );

  private readonly draft = signal<TaskDraft>({
    title: '',
    description: '',
    status: this.data?.status ?? 'todo',
    assigneeId: CURRENT_USER_ID,
    dueDate: dateInputValue(Date.now() + DEFAULT_DUE_IN_DAYS * MILLISECONDS_PER_DAY),
    priority: 'medium',
  });

  protected readonly taskForm = form(
    this.draft,
    (path) => {
      required(path.title, { message: 'Give the task a title.' });
    },
    {
      submission: {
        action: async () => this.createTask(),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  private async createTask(): Promise<void> {
    const draft = this.draft();
    const task = await this.tasks.create({
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status as TaskStatus,
      priority: draft.priority as TaskPriority,
      assigneeId: draft.assigneeId,
      dueAt: timestampOf(draft.dueDate),
    });
    this.dialogRef.close(task.id);
    this.toasts.show(`${task.id} created in ${TASK_STATUS_LABELS[task.status]}`, {
      actionLabel: 'View',
      onAction: () => void this.router.navigate(['/tasks'], { queryParams: { task: task.id } }),
    });
  }
}
