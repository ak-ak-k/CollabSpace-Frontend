import { Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationState } from '../../core/state/notification.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { BrandMarkComponent } from '../../shared/components/brand-mark/brand-mark.component';
import { WorkspaceSwitcherSheet } from '../../shared/components/workspace-switcher/workspace-switcher-sheet.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-mobile-header',
  imports: [RouterLink, BrandMarkComponent, IconComponent, IconButtonComponent, BadgeComponent],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss',
})
export class MobileHeaderComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly notifications = inject(NotificationState);

  protected readonly switcherSheet = inject(WorkspaceSwitcherSheet);

  readonly searchRequested = output<void>();

  protected readonly workspaceName = computed(() => this.workspace.currentWorkspace()?.name ?? '');
  protected readonly workspaceLabel = computed(
    () => `Workspace menu, current: ${this.workspaceName()}`,
  );
  protected readonly unreadCount = this.notifications.unreadCount;
  protected readonly notificationsLabel = computed(() =>
    this.unreadCount() > 0 ? `Notifications, ${this.unreadCount()} unread` : 'Notifications',
  );
}
