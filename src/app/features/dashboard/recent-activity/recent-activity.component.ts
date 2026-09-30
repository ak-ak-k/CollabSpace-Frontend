import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ActivityView } from '../dashboard-view';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-dashboard-recent-activity',
  imports: [
    RouterLink,
    SectionHeaderComponent,
    AvatarComponent,
    IconComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss',
  host: { role: 'region', 'aria-labelledby': 'dashboard-activity' },
})
export class RecentActivityComponent {
  private readonly router = inject(Router);

  readonly status = input.required<LoadStatus>();
  readonly activity = input.required<readonly ActivityView[]>();

  readonly retry = output<void>();

  protected linkTo(route: string): UrlTree {
    return this.router.parseUrl(route);
  }
}
