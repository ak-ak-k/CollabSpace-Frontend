import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { apply, form, FormField, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { carriedEmail, emailRules, focusFirstInvalid } from '../auth-layout/auth-form-rules';

interface ResetRequestModel {
  readonly email: string;
}

@Component({
  selector: 'app-forgot-password',
  imports: [FormField, FormRoot, RouterLink, ButtonComponent, IconComponent, InputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthState);
  private readonly injector = inject(Injector);
  private readonly toasts = inject(ToastService);

  private readonly sentTitle = viewChild<ElementRef<HTMLElement>>('sentTitle');
  private readonly request = signal<ResetRequestModel>({ email: carriedEmail(inject(Router)) });

  protected readonly sentTo = signal('');

  protected readonly requestForm = form(
    this.request,
    (path) => {
      apply(path.email, emailRules);
    },
    {
      submission: {
        action: async () => this.sendResetLink(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  protected readonly submitting = computed(() => this.requestForm().submitting());

  protected resendLink(): void {
    this.toasts.show(`We sent another link to ${this.sentTo()}`, { icon: 'mail' });
  }

  private async sendResetLink(): Promise<void> {
    await this.auth.requestPasswordReset();
    this.sentTo.set(this.request().email.trim());
    afterNextRender(() => this.sentTitle()?.nativeElement.focus(), { injector: this.injector });
  }
}
