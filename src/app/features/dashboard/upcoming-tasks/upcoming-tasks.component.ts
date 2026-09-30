import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { UpcomingTaskView } from '../dashboard-view';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-dashboard-upcoming-tasks',
  imports: [
    RouterLink,
    SectionHeaderComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TagComponent,
    IconComponent,
    AvatarComponent,
  ],
  templateUrl: './upcoming-tasks.component.html',
  styleUrl: './upcoming-tasks.component.scss',
  host: { role: 'region', 'aria-labelledby': 'dashboard-tasks' },
})
export class UpcomingTasksComponent {
  readonly status = input.required<LoadStatus>();
  readonly tasks = input.required<readonly UpcomingTaskView[]>();

  readonly retry = output<void>();
  readonly newTask = output<void>();
}
