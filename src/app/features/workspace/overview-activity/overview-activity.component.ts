import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivityRow } from '../../../core/state/activity-row';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

const OVERVIEW_EVENT_COUNT = 7;
const ACTIVITY_ROUTE = '/activity';

@Component({
  selector: 'app-overview-activity',
  imports: [
    ActivityFeedComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
    SectionHeaderComponent,
  ],
  templateUrl: './overview-activity.component.html',
  styleUrl: './overview-activity.component.scss',
})
export class OverviewActivityComponent {
  readonly items = input.required<readonly ActivityRow[]>();

  protected readonly activityRoute = ACTIVITY_ROUTE;
  protected readonly caption = computed(() =>
    this.items().length ? formatCount(this.items().length, 'event') : '',
  );
  protected readonly shown = computed(() => this.items().slice(0, OVERVIEW_EVENT_COUNT));
}
