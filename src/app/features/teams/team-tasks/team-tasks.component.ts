import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { TeamTaskView } from '../team-task-view';

const TASKS_ROUTE = '/tasks';

@Component({
  selector: 'app-team-tasks',
  imports: [
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TagComponent,
  ],
  templateUrl: './team-tasks.component.html',
  styleUrl: './team-tasks.component.scss',
})
export class TeamTasksComponent {
  readonly teamId = input.required<string>();
  readonly tasks = input.required<readonly TeamTaskView[]>();
  readonly status = input<LoadStatus>('ready');

  readonly retry = output<void>();

  protected readonly headingId = createUniqueId('team-tasks-heading');
  protected readonly tasksRoute = TASKS_ROUTE;
  protected readonly boardQuery = computed(() => ({ team: this.teamId() }));
}
