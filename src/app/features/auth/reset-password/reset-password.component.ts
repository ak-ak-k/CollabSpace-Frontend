import { Component, computed, inject, signal } from '@angular/core';
import { apply, form, FormField, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PasswordStrengthComponent } from '../../../shared/ui/input/password-strength/password-strength.component';
import {
  focusFirstInvalid,
  LOGIN_URL,
  passwordPairRules,
  PasswordPair,
} from '../auth-layout/auth-form-rules';

const EMPTY_PASSWORDS: PasswordPair = { password: '', confirmPassword: '' };

@Component({
  selector: 'app-reset-password',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    ButtonComponent,
    IconComponent,
    InputComponent,
    PasswordStrengthComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  private readonly passwords = signal<PasswordPair>(EMPTY_PASSWORDS);

  protected readonly resetForm = form(
    this.passwords,
    (path) => {
      apply(path, passwordPairRules('Enter a new password.'));
    },
    {
      submission: {
        action: async () => this.resetPassword(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  protected readonly submitting = computed(() => this.resetForm().submitting());

  private async resetPassword(): Promise<void> {
    await this.auth.resetPassword();
    this.toasts.show('Password reset — log in with your new password', { icon: 'key-round' });
    await this.router.navigateByUrl(LOGIN_URL);
  }
}
