import { Component, computed, inject, input, signal } from '@angular/core';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import { Task } from '../../../core/models/task';
import { firstNameOf } from '../../../core/models/user';
import { TaskHistoryState } from '../../../core/state/task-history.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { formatDate, formatRelative } from '../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';

interface HistoryRow {
  readonly id: string;
  readonly who: string;
  readonly text: string;
  readonly when: string;
}

const CREATED_DATE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};
const SEPARATOR = ' · ';

@Component({
  selector: 'app-task-history',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './task-history.component.html',
  styleUrl: './task-history.component.scss',
})
export class TaskHistoryComponent {
  private readonly history = inject(TaskHistoryState);
  private readonly workspace = inject(WorkspaceState);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-history');
  protected readonly expanded = signal(false);
  protected readonly rows = computed<readonly HistoryRow[]>(() =>
    this.history.entriesFor(this.task().id).map((entry) => ({
      id: entry.id,
      who: this.actorName(entry.actorId),
      text: entry.text,
      when: formatRelative(entry.at),
    })),
  );
  protected readonly toggleLabel = computed(
    () => `${this.expanded() ? 'Hide' : 'Show'} history (${this.rows().length})`,
  );
  protected readonly metaLine = computed(() => {
    const task = this.task();
    return [
      `Created${this.reporterPhrase(task.reporterId)}`,
      formatDate(task.createdAt, CREATED_DATE),
      `Updated ${formatRelative(task.updatedAt).toLowerCase()}`,
    ].join(SEPARATOR);
  });

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }

  private actorName(userId: string): string {
    if (userId === CURRENT_USER_ID) {
      return 'You';
    }
    const user = this.workspace.user(userId);
    return user ? firstNameOf(user.name) : 'Someone';
  }

  private reporterPhrase(userId: string): string {
    if (userId === CURRENT_USER_ID) {
      return ' by you';
    }
    const user = this.workspace.user(userId);
    return user ? ` by ${user.name}` : '';
  }
}
