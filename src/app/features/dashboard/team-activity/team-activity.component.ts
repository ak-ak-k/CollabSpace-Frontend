import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TeamActivityView } from '../dashboard-view';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-dashboard-team-activity',
  imports: [
    RouterLink,
    SectionHeaderComponent,
    AvatarComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './team-activity.component.html',
  styleUrl: './team-activity.component.scss',
  host: { role: 'region', 'aria-labelledby': 'dashboard-teams' },
})
export class TeamActivityComponent {
  readonly status = input.required<LoadStatus>();
  readonly teams = input.required<readonly TeamActivityView[]>();

  readonly retry = output<void>();
}
