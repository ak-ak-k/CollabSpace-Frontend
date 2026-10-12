import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { apply, form, FormField, FormRoot } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstNameOf } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { SessionReturnState } from '../../../core/state/session-return.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import {
  carriedEmail,
  emailRules,
  focusFirstInvalid,
  HOME_URL,
  passwordRules,
} from '../auth-layout/auth-form-rules';

interface LoginModel {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
}

const SESSION_EXPIRED_PARAMETER = 'expired';
const RETURN_URL_PARAMETER = 'returnUrl';

const safeReturnUrl = (value: string | null | undefined): string | null =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    ButtonComponent,
    CheckboxComponent,
    IconComponent,
    InputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly workspace = inject(WorkspaceState);
  private readonly sessionReturn = inject(SessionReturnState);
  private readonly queryParameters = toSignal(inject(ActivatedRoute).queryParamMap);

  private readonly credentials = signal<LoginModel>({
    email: carriedEmail(this.router),
    password: '',
    remember: true,
  });

  protected readonly googleBusy = signal(false);
  protected readonly sessionExpired = computed(
    () =>
      this.auth.sessionExpired() ||
      (this.queryParameters()?.has(SESSION_EXPIRED_PARAMETER) ?? false),
  );

  protected readonly loginForm = form(
    this.credentials,
    (path) => {
      apply(path.email, emailRules);
      apply(path.password, passwordRules('Enter your password.'));
    },
    {
      submission: {
        action: async () => this.logIn(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  protected readonly submitting = computed(() => this.loginForm().submitting());
  protected readonly busy = computed(() => this.googleBusy() || this.submitting());

  protected async continueWithGoogle(): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.googleBusy.set(true);
    try {
      await this.logIn();
    } finally {
      this.googleBusy.set(false);
    }
  }

  private async logIn(): Promise<void> {
    await this.auth.login();
    this.toasts.show(this.welcomeMessage(), { icon: 'circle-check' });
    const remembered = this.sessionReturn.take();
    const returnUrl = safeReturnUrl(this.queryParameters()?.get(RETURN_URL_PARAMETER));
    await this.router.navigateByUrl(returnUrl ?? remembered ?? HOME_URL);
  }

  private welcomeMessage(): string {
    const user = this.workspace.currentUser();
    return user ? `Welcome back, ${firstNameOf(user.name)}` : 'Welcome back';
  }
}
