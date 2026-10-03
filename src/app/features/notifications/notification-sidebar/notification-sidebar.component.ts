import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecondarySidebarComponent } from '../../../layout/secondary-sidebar/secondary-sidebar.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { NotificationCategoryView } from '../notifications-view';

@Component({
  selector: 'app-notification-sidebar',
  imports: [RouterLink, SecondarySidebarComponent, BadgeComponent, IconComponent],
  templateUrl: './notification-sidebar.component.html',
  styleUrl: './notification-sidebar.component.scss',
})
export class NotificationSidebarComponent {
  readonly categories = input.required<readonly NotificationCategoryView[]>();
}
