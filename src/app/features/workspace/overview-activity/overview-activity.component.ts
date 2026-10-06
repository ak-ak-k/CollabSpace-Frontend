import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { WORKSPACE_ROUTE } from '../workspace-actions.service';
import { OverviewActivityItem } from '../workspace-overview/overview-view';

const OVERVIEW_EVENT_COUNT = 7;

@Component({
  selector: 'app-overview-activity',
  imports: [
    AvatarComponent,
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
  private readonly router = inject(Router);

  readonly items = input.required<readonly OverviewActivityItem[]>();

  protected readonly activityRoute = `${WORKSPACE_ROUTE}/activity`;
  protected readonly caption = computed(() =>
    this.items().length ? formatCount(this.items().length, 'event') : '',
  );
  protected readonly shown = computed(() => this.items().slice(0, OVERVIEW_EVENT_COUNT));

  protected linkTo(route: string): UrlTree {
    return this.router.parseUrl(route);
  }
}
