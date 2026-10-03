import { Component, inject } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AccountEmailFormComponent } from '../account-email-form/account-email-form.component';
import { AccountPasswordFormComponent } from '../account-password-form/account-password-form.component';
import { DangerZoneComponent } from '../danger-zone/danger-zone.component';

@Component({
  selector: 'app-settings-account',
  imports: [
    AccountEmailFormComponent,
    AccountPasswordFormComponent,
    ButtonComponent,
    DangerZoneComponent,
    IconComponent,
  ],
  templateUrl: './settings-account.component.html',
  styleUrl: './settings-account.component.scss',
})
export class SettingsAccountComponent {
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);

  protected async deleteAccount(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: 'Delete your account?',
      body: 'Your profile and personal data will be removed within 30 days. This can’t be undone.',
      confirmLabel: 'Delete account',
      icon: 'trash-2',
    });
    if (confirmed) {
      this.toasts.show('Account deletion requested (prototype)', { icon: 'info' });
    }
  }
}
