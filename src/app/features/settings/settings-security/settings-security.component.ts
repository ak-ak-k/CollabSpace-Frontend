import { Component, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SessionListComponent } from '../session-list/session-list.component';
import { SettingRowComponent } from '../setting-row/setting-row.component';
import { SettingSwitchComponent } from '../setting-switch/setting-switch.component';
import { settingsLinkOf } from '../settings-sections';

@Component({
  selector: 'app-settings-security',
  imports: [
    RouterLink,
    ButtonComponent,
    SessionListComponent,
    SettingRowComponent,
    SettingSwitchComponent,
  ],
  templateUrl: './settings-security.component.html',
  styleUrl: './settings-security.component.scss',
})
export class SettingsSecurityComponent {
  private readonly state = inject(PreferencesState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);

  protected readonly accountLink = settingsLinkOf('account');
  protected readonly twoFactor = linkedSignal(() => this.state.preferences().twoFactor);

  protected async setTwoFactor(on: boolean): Promise<void> {
    if (on) {
      this.applyTwoFactor(true);
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: 'Turn off two-step verification?',
      body: 'Your account will only be protected by your password.',
      confirmLabel: 'Turn off',
      icon: 'shield',
    });
    if (confirmed) {
      this.applyTwoFactor(false);
    } else {
      this.twoFactor.set(true);
    }
  }

  private applyTwoFactor(on: boolean): void {
    void this.state.update({ twoFactor: on });
    this.toasts.show(`Two-step verification ${on ? 'on' : 'off'}`, {
      icon: on ? 'shield-check' : 'shield',
    });
  }
}
