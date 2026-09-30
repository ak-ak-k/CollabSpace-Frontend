import { Component, computed, inject, signal } from '@angular/core';
import { apply, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PasswordStrengthComponent } from '../../../shared/ui/input/password-strength/password-strength.component';
import {
  carriedEmail,
  emailRules,
  focusFirstInvalid,
  HOME_URL,
  nameRules,
  passwordPairRules,
  PasswordPair,
} from '../auth-layout/auth-form-rules';

interface SignupModel extends PasswordPair {
  readonly fullName: string;
  readonly email: string;
  readonly workspaceName: string;
  readonly acceptTerms: boolean;
}

const DEFAULT_WORKSPACE_SLUG = 'your-team';
const WORKSPACE_DOMAIN = 'collabspace.app';

const workspaceSlugOf = (workspaceName: string): string =>
  workspaceName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || DEFAULT_WORKSPACE_SLUG;

@Component({
  selector: 'app-signup',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    ButtonComponent,
    CheckboxComponent,
    IconComponent,
    InputComponent,
    PasswordStrengthComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  private readonly account = signal<SignupModel>({
    fullName: '',
    email: carriedEmail(this.router),
    password: '',
    confirmPassword: '',
    workspaceName: '',
    acceptTerms: false,
  });

  protected readonly signupForm = form(
    this.account,
    (path) => {
      apply(path.fullName, nameRules('Enter your full name.'));
      apply(path.email, emailRules);
      apply(path, passwordPairRules('Enter your password.'));
      apply(path.workspaceName, nameRules('Name your workspace — you can change it later.'));
      required(path.acceptTerms, { message: 'Please accept the terms to continue.' });
    },
    {
      submission: {
        action: async () => this.createWorkspace(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  protected readonly submitting = computed(() => this.signupForm().submitting());
  protected readonly addressHint = computed(
    () => `Your address: ${workspaceSlugOf(this.account().workspaceName)}.${WORKSPACE_DOMAIN}`,
  );

  protected showLegalNotice(): void {
    this.toasts.show('Legal pages open in a new tab in the live product', { icon: 'info' });
  }

  private async createWorkspace(): Promise<void> {
    const workspaceName = this.account().workspaceName.trim();
    await this.auth.signup();
    this.toasts.show(`Workspace “${workspaceName}” created`, { icon: 'badge-check' });
    await this.router.navigateByUrl(HOME_URL);
  }
}
