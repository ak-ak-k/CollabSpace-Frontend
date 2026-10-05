import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal, WritableSignal } from '@angular/core';
import {
  TASK_COLUMNS,
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TaskPriority,
  TaskStatus,
} from '../../../core/models/task';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { DUE_FILTER_LABELS, isDueFilter, TaskFilters, toggled } from '../tasks-filters';

export interface TaskFiltersData {
  readonly filters: WritableSignal<TaskFilters>;
  readonly teamId: Signal<string>;
  readonly teamOptions: Signal<readonly SelectOption[]>;
  readonly resultCount: Signal<number>;
  readonly selectTeam: (teamId: string) => void;
  readonly clearAll: () => void;
}

interface ChipOption<Value> {
  readonly value: Value;
  readonly label: string;
}

const STATUS_OPTIONS: readonly ChipOption<TaskStatus>[] = TASK_COLUMNS.map((column) => ({
  value: column.status,
  label: column.label,
}));
const PRIORITY_OPTIONS: readonly ChipOption<TaskPriority>[] = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: TASK_PRIORITY_LABELS[priority],
}));
const DUE_OPTIONS: readonly RadioOption[] = Object.entries(DUE_FILTER_LABELS).map(
  ([value, label]) => ({ value, label }),
);

@Component({
  selector: 'app-tasks-filters',
  imports: [
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    RadioGroupComponent,
    SelectComponent,
  ],
  templateUrl: './tasks-filters.component.html',
  styleUrl: './tasks-filters.component.scss',
})
export class TasksFiltersComponent {
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<TaskFiltersData>(DIALOG_DATA);

  protected readonly titleId = createOverlayId('tasks-filters-title');
  protected readonly statusLabelId = `${this.titleId}-status`;
  protected readonly priorityLabelId = `${this.titleId}-priority`;
  protected readonly labelsLabelId = `${this.titleId}-labels`;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly labelOptions = TASK_LABELS;
  protected readonly dueOptions = DUE_OPTIONS;
  protected readonly filters = this.data.filters;
  protected readonly showLabel = computed(
    () => `Show ${formatCount(this.data.resultCount(), 'task')}`,
  );

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected toggleStatus(status: TaskStatus): void {
    this.filters.update((filters) => ({ ...filters, statuses: toggled(filters.statuses, status) }));
  }

  protected togglePriority(priority: TaskPriority): void {
    this.filters.update((filters) => ({
      ...filters,
      priorities: toggled(filters.priorities, priority),
    }));
  }

  protected toggleLabel(label: string): void {
    this.filters.update((filters) => ({ ...filters, labels: toggled(filters.labels, label) }));
  }

  protected setDue(value: string): void {
    if (isDueFilter(value)) {
      this.filters.update((filters) => ({ ...filters, due: value }));
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
