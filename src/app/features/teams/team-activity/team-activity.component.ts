import { Component, input } from '@angular/core';
import { ActivityRow } from '../../../core/state/activity-row';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-team-activity',
  imports: [ActivityFeedComponent, EmptyStateComponent],
  templateUrl: './team-activity.component.html',
  styleUrl: './team-activity.component.scss',
})
export class TeamActivityComponent {
  readonly activity = input.required<readonly ActivityRow[]>();
}
