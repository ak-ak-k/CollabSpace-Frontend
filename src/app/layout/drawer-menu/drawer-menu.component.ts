import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  PRESENCE_LABELS,
  PRESENCE_OPTIONS,
  PresenceOption,
  userColorSeed,
} from '../../core/models/user';
import { Workspace } from '../../core/models/workspace';
import { ToastService } from '../../core/services/toast.service';
import { AuthState } from '../../core/state/auth.state';
import { NetworkState } from '../../core/state/network.state';
import { ThemeState } from '../../core/state/theme.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { DrawerComponent } from '../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { StatusDotComponent } from '../../shared/ui/status-dot/status-dot.component';
import { ToggleComponent } from '../../shared/ui/toggle/toggle.component';
import { DRAWER_NAVIGATION } from '../navigation';
import { NavigationBadges } from '../navigation-badges';

@Component({
  selector: 'app-drawer-menu',
  imports: [
    RouterLink,
    DrawerComponent,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    IconComponent,
    StatusDotComponent,
    ToggleComponent,
  ],
  templateUrl: './drawer-menu.component.html',
  styleUrl: './drawer-menu.component.scss',
})
export class DrawerMenuComponent {
  private readonly dialogRef = inject(DialogRef);
  private readonly workspace = inject(WorkspaceState);
  private readonly auth = inject(AuthState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly theme = inject(ThemeState);
  protected readonly network = inject(NetworkState);
  protected readonly badges = inject(NavigationBadges);

  protected readonly links = DRAWER_NAVIGATION;
  protected readonly statusOptions = PRESENCE_OPTIONS;
  protected readonly me = this.workspace.currentUser;
  protected readonly workspaces = this.workspace.workspaces;
  protected readonly currentWorkspaceId = this.workspace.currentWorkspaceId;
  protected readonly mySeed = computed(() => userColorSeed(this.me()?.id ?? ''));
  protected readonly summary = computed(() => {
    const me = this.me();
    const workspaceName = this.workspace.currentWorkspace()?.name ?? '';
    return me ? `${PRESENCE_LABELS[me.status]} · ${workspaceName}` : workspaceName;
  });

  protected close(): void {
    this.dialogRef.close();
  }

  protected async setStatus(option: PresenceOption): Promise<void> {
    this.close();
    await this.workspace.setPresence(option.status);
    this.toasts.show(`Status set to ${option.label}`);
  }

  protected pickWorkspace(workspace: Workspace): void {
    const changed = workspace.id !== this.currentWorkspaceId();
    this.workspace.switchWorkspace(workspace.id);
    this.close();
    if (changed) {
      this.toasts.show(`Switched to ${workspace.name} (demo keeps Northstar data)`, {
        icon: 'building-2',
      });
    }
  }

  protected signOut(): void {
    this.close();
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
