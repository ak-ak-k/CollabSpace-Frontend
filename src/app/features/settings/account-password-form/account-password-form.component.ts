import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, required, validate } from '@angular/forms/signals';
import { ToastService } from '../../../core/services/toast.service';
import { MINIMUM_PASSWORD_LENGTH } from '../../../core/state/auth.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import {
  CURRENT_PASSWORD_MESSAGE,
  focusFirstInvalid,
  mismatchError,
  PASSWORD_LENGTH_MESSAGE,
} from '../settings-forms';

interface PasswordChange {
  readonly current: string;
  readonly next: string;
  readonly confirmation: string;
}

const EMPTY_PASSWORDS: PasswordChange = { current: '', next: '', confirmation: '' };

@Component({
  selector: 'app-account-password-form',
  imports: [FormField, FormRoot, ButtonComponent, InputComponent],
  templateUrl: './account-password-form.component.html',
  styleUrl: './account-password-form.component.scss',
})
export class AccountPasswordFormComponent {
  private readonly toasts = inject(ToastService);

  private readonly passwords = signal<PasswordChange>(EMPTY_PASSWORDS);

  protected readonly passwordForm = form(
    this.passwords,
    (path) => {
      required(path.current, { message: CURRENT_PASSWORD_MESSAGE });
      required(path.next, { message: PASSWORD_LENGTH_MESSAGE });
      minLength(path.next, MINIMUM_PASSWORD_LENGTH, { message: PASSWORD_LENGTH_MESSAGE });
      validate(path.confirmation, ({ value, valueOf }) =>
        mismatchError(value(), valueOf(path.next)),
      );
    },
    {
      submission: {
        action: async () => this.updatePassword(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  private updatePassword(): void {
    this.passwordForm().reset(EMPTY_PASSWORDS);
    this.toasts.show('Password updated', { icon: 'key-round' });
  }
}
