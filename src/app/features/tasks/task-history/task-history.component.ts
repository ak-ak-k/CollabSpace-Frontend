import { Component, computed, inject, input, signal } from '@angular/core';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import { Task } from '../../../core/models/task';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed.component';
import { formatDate, formatRelative } from '../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';

const CREATED_DATE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};
const SEPARATOR = ' · ';

@Component({
  selector: 'app-task-history',
  imports: [ActivityFeedComponent, ButtonComponent, IconComponent],
  templateUrl: './task-history.component.html',
  styleUrl: './task-history.component.scss',
})
export class TaskHistoryComponent {
  private readonly activity = inject(WorkspaceActivityState);
  private readonly workspace = inject(WorkspaceState);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-history');
  protected readonly expanded = signal(false);
  protected readonly rows = computed(() => this.activity.entityRows('task', this.task().id));
  protected readonly toggleLabel = computed(
    () => `${this.expanded() ? 'Hide' : 'Show'} activity (${this.rows().length})`,
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

  private reporterPhrase(userId: string): string {
    if (userId === CURRENT_USER_ID) {
      return ' by you';
    }
    const user = this.workspace.user(userId);
    return user ? ` by ${user.name}` : '';
  }
}
