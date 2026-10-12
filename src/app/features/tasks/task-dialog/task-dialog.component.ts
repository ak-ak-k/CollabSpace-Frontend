import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import {
  isTaskPriority,
  isTaskStatus,
  TASK_COLUMNS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskStatus,
} from '../../../core/models/task';
import { ToastService } from '../../../core/services/toast.service';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { fromDateInputValue, toDateInputValue } from '../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { memberOptionsOf, teamOptionsOf } from '../task-options';

export interface TaskDialogData {
  readonly status?: TaskStatus;
  readonly teamId?: string | null;
}

interface TaskDraft {
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly assigneeId: string;
  readonly teamId: string;
  readonly dueDate: string;
  readonly priority: string;
}

const DEFAULT_DUE_IN_DAYS = 3;
const MILLISECONDS_PER_DAY = 86_400_000;

const timestampOf = (dateInput: string): number => fromDateInputValue(dateInput) ?? Date.now();

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
  protected readonly assigneeOptions = computed(() =>
    memberOptionsOf(this.workspace.members(), CURRENT_USER_ID),
  );
  protected readonly teamOptions = computed(() => teamOptionsOf(this.workspace.teams()));

  private readonly draft = signal<TaskDraft>({
    title: '',
    description: '',
    status: this.data?.status ?? 'todo',
    assigneeId: CURRENT_USER_ID,
    teamId: this.initialTeamId(),
    dueDate: toDateInputValue(Date.now() + DEFAULT_DUE_IN_DAYS * MILLISECONDS_PER_DAY),
    priority: 'medium',
  });

  protected readonly subtitle = computed(() => {
    const workspaceName = this.workspace.currentWorkspace()?.name ?? 'this workspace';
    const team = this.workspace.team(this.draft().teamId);
    return team ? `In ${workspaceName} · ${team.name}` : `In ${workspaceName}`;
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

  constructor() {
    if (!this.workspace.access().canCreateTasks) {
      const workspaceName = this.workspace.currentWorkspace()?.name ?? 'this workspace';
      this.toasts.show(`Guests can’t create tasks in ${workspaceName}`, { icon: 'lock' });
      afterNextRender(() => this.dialogRef.close());
    }
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  private initialTeamId(): string {
    const teamId = this.data?.teamId ?? '';
    return teamId && this.workspace.team(teamId) ? teamId : '';
  }

  private async createTask(): Promise<void> {
    const draft = this.draft();
    const task = await this.tasks.create({
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: isTaskStatus(draft.status) ? draft.status : 'todo',
      priority: isTaskPriority(draft.priority) ? draft.priority : 'medium',
      assigneeId: draft.assigneeId || null,
      teamId: draft.teamId || null,
      dueAt: timestampOf(draft.dueDate),
    });
    this.dialogRef.close(task.id);
    const savedOffline = this.tasks.task(task.id)?.pending ?? false;
    const message = savedOffline
      ? `${task.id} saved offline — it syncs when you reconnect`
      : `${task.id} created in ${TASK_STATUS_LABELS[task.status]}`;
    this.toasts.show(message, {
      icon: savedOffline ? 'cloud-off' : undefined,
      actionLabel: 'View',
      onAction: () => void this.router.navigate(['/tasks'], { queryParams: { task: task.id } }),
    });
  }
}
