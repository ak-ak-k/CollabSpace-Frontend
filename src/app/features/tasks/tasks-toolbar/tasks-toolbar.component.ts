import { Component, computed, input, model } from '@angular/core';
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS } from '../../../core/models/task';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TaskPerson } from '../tasks-view';

const PRIORITY_OPTIONS: readonly SelectOption[] = [
  { value: 'all', label: 'All' },
  ...TASK_PRIORITIES.map((priority) => ({
    value: priority,
    label: TASK_PRIORITY_LABELS[priority],
  })),
];

@Component({
  selector: 'app-tasks-toolbar',
  imports: [AvatarComponent, ButtonComponent, IconComponent, SearchInputComponent, SelectComponent],
  templateUrl: './tasks-toolbar.component.html',
  styleUrl: './tasks-toolbar.component.scss',
})
export class TasksToolbarComponent {
  readonly query = model('');
  readonly assigneeIds = model<readonly string[]>([]);
  readonly priority = model('all');
  readonly people = input<readonly TaskPerson[]>([]);
  readonly visibleCount = input(0);
  readonly totalCount = input(0);
  readonly showCount = input(false);

  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly filtered = computed(
    () => this.query().trim() !== '' || this.assigneeIds().length > 0 || this.priority() !== 'all',
  );
  protected readonly countLabel = computed(
    () => `${this.visibleCount()} of ${formatCount(this.totalCount(), 'task')}`,
  );

  protected toggleAssignee(userId: string): void {
    this.assigneeIds.update((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  }

  protected clear(): void {
    this.query.set('');
    this.assigneeIds.set([]);
    this.priority.set('all');
  }
}
