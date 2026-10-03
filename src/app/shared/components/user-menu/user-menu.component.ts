import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PRESENCE_OPTIONS, PresenceOption, userColorSeed } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { DATA_MODE_OPTIONS, DataModeState } from '../../../core/state/data-mode.state';
import { InstallState } from '../../../core/state/install.state';
import { NetworkState } from '../../../core/state/network.state';
import { ThemeState } from '../../../core/state/theme.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { DROPDOWN_IMPORTS } from '../../ui/dropdown/dropdown-imports';
import { IconComponent } from '../../ui/icon/icon.component';
import { StatusDotComponent } from '../../ui/status-dot/status-dot.component';

@Component({
  selector: 'app-user-menu',
  imports: [...DROPDOWN_IMPORTS, RouterLink, AvatarComponent, IconComponent, StatusDotComponent],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly auth = inject(AuthState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly theme = inject(ThemeState);
  protected readonly network = inject(NetworkState);
  protected readonly dataMode = inject(DataModeState);
  protected readonly installer = inject(InstallState);

  protected readonly statusOptions = PRESENCE_OPTIONS;
  protected readonly dataModeOptions = DATA_MODE_OPTIONS;
  protected readonly me = this.workspace.currentUser;
  protected readonly mySeed = computed(() => userColorSeed(this.me()?.id ?? ''));

  protected async setStatus(option: PresenceOption): Promise<void> {
    await this.workspace.setPresence(option.status);
    this.toasts.show(`Status set to ${option.label}`);
  }

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
