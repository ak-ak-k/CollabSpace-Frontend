import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TeamActivityItem } from '../team-view';

@Component({
  selector: 'app-team-activity',
  imports: [RouterLink, AvatarComponent, EmptyStateComponent, IconComponent],
  templateUrl: './team-activity.component.html',
  styleUrl: './team-activity.component.scss',
})
export class TeamActivityComponent {
  private readonly router = inject(Router);

  readonly activity = input.required<readonly TeamActivityItem[]>();

  protected linkTo(route: string): UrlTree | null {
    return route ? this.router.parseUrl(route) : null;
  }
}
