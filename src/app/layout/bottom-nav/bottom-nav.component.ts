import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CurrentRoute } from '../current-route';
import { BOTTOM_NAVIGATION } from '../navigation';
import { NavigationBadges } from '../navigation-badges';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, IconComponent, BadgeComponent],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  protected readonly badges = inject(NavigationBadges);
  protected readonly route = inject(CurrentRoute);

  readonly moreRequested = output<void>();

  protected readonly items = BOTTOM_NAVIGATION;
}
