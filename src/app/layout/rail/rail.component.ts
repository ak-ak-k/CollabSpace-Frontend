import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeState } from '../../core/state/theme.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { PRESENCE_LABELS, userColorSeed } from '../../core/models/user';
import { BrandMarkComponent } from '../../shared/components/brand-mark/brand-mark.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { WorkspaceMenuComponent } from '../../shared/components/workspace-menu/workspace-menu.component';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CurrentRoute } from '../current-route';
import { PRIMARY_NAVIGATION, SETTINGS_ROUTE } from '../navigation';
import { NavigationBadges } from '../navigation-badges';

const MENU_GAP = 8;

const MENU_BESIDE_TOP: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'start',
  overlayY: 'top',
  offsetX: MENU_GAP,
};

const MENU_BESIDE_BOTTOM: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'start',
  overlayY: 'bottom',
  offsetX: MENU_GAP,
};

@Component({
  selector: 'app-rail',
  imports: [
    RouterLink,
    RouterLinkActive,
    CdkMenuTrigger,
    IconComponent,
    AvatarComponent,
    BadgeComponent,
    BrandMarkComponent,
    UserMenuComponent,
    WorkspaceMenuComponent,
  ],
  templateUrl: './rail.component.html',
  styleUrl: './rail.component.scss',
})
export class RailComponent {
  private readonly workspace = inject(WorkspaceState);

  protected readonly theme = inject(ThemeState);
  protected readonly badges = inject(NavigationBadges);
  protected readonly route = inject(CurrentRoute);

  readonly searchRequested = output<void>();

  protected readonly items = PRIMARY_NAVIGATION;
  protected readonly settingsRoute = SETTINGS_ROUTE;
  protected readonly workspaceMenuPositions = [MENU_BESIDE_TOP];
  protected readonly userMenuPositions = [MENU_BESIDE_BOTTOM];

  protected readonly currentWorkspace = this.workspace.currentWorkspace;
  protected readonly me = this.workspace.currentUser;
  protected readonly mySeed = computed(() => userColorSeed(this.me()?.id ?? ''));

  protected readonly workspaceLabel = computed(
    () => `Switch workspace, current: ${this.currentWorkspace()?.name ?? ''}`,
  );
  protected readonly accountLabel = computed(() => {
    const me = this.me();
    return me
      ? `Account menu for ${me.name}, status ${PRESENCE_LABELS[me.status]}`
      : 'Account menu';
  });
  protected readonly themeLabel = computed(() =>
    this.theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
