import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import {
  Task,
  TASK_COLUMNS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TaskPriority,
  TaskStatus,
} from '../../../core/models/task';
import { ToastService } from '../../../core/services/toast.service';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { fromDateInputValue, toDateInputValue } from '../../../shared/pipes/time-format';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { TaskActions } from '../task-actions.service';
import { TASK_LABELS } from '../tasks-view';

const STATUS_OPTIONS: readonly SelectOption[] = TASK_COLUMNS.map((column) => ({
  value: column.status,
  label: column.label,
}));

const PRIORITY_OPTIONS: readonly SelectOption[] = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: TASK_PRIORITY_LABELS[priority],
}));

@Component({
  selector: 'app-task-editor',
  imports: [IconComponent, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './task-editor.component.html',
  styleUrl: './task-editor.component.scss',
})
export class TaskEditorComponent {
  private readonly tasks = inject(TaskState);
  private readonly actions = inject(TaskActions);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly announcer = inject(LiveAnnouncer);

  readonly task = input.required<Task>();
  readonly titleId = input.required<string>();

  protected readonly labels = TASK_LABELS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly titleDraft = linkedSignal(() => this.task().title);
  protected readonly descriptionDraft = linkedSignal(() => this.task().description);
  protected readonly dueValue = computed(() => toDateInputValue(this.task().dueAt));
  protected readonly assigneeOptions = computed<readonly SelectOption[]>(() =>
    this.workspace.members().map((user) => ({
      value: user.id,
      label: user.id === this.workspace.currentUser()?.id ? `${user.name} (you)` : user.name,
    })),
  );

  protected saveTitle(): void {
    const title = this.titleDraft().trim();
    if (!title) {
      this.titleDraft.set(this.task().title);
      void this.announcer.announce('A task needs a title, so the previous title was kept');
      return;
    }
    if (title !== this.task().title) {
      void this.tasks.update(this.task().id, { title });
      this.toasts.show('Title updated', { icon: 'pencil' });
    }
  }

  protected saveDescription(): void {
    const description = this.descriptionDraft().trim();
    if (description !== this.task().description) {
      void this.tasks.update(this.task().id, { description });
      this.toasts.show('Description saved', { icon: 'circle-check' });
    }
  }

  protected changeStatus(value: string): void {
    const column = TASK_COLUMNS.find((candidate) => candidate.status === value);
    if (column && column.status !== this.task().status) {
      void this.actions.move(this.task().id, column.status satisfies TaskStatus);
    }
  }

  protected changePriority(value: string): void {
    const priority = TASK_PRIORITIES.find((candidate) => candidate === value);
    if (priority) {
      void this.tasks.update(this.task().id, { priority: priority satisfies TaskPriority });
    }
  }

  protected changeAssignee(value: string): void {
    void this.tasks.update(this.task().id, { assigneeId: value || null });
  }

  protected changeDue(value: string): void {
    const dueAt = fromDateInputValue(value);
    if (dueAt !== null && dueAt !== this.task().dueAt) {
      void this.tasks.update(this.task().id, { dueAt });
    }
  }

  protected toggleLabel(label: string): void {
    const labels = this.task().labels;
    const next = labels.includes(label)
      ? labels.filter((candidate) => candidate !== label)
      : [...labels, label];
    void this.tasks.update(this.task().id, { labels: next });
  }
}
