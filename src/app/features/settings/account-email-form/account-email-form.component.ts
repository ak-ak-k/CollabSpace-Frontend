import { Component, computed, inject, linkedSignal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { ToastService } from '../../../core/services/toast.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { emailError, focusFirstInvalid } from '../settings-forms';

interface EmailDraft {
  readonly email: string;
}

@Component({
  selector: 'app-account-email-form',
  imports: [FormField, FormRoot, ButtonComponent, InputComponent],
  templateUrl: './account-email-form.component.html',
  styleUrl: './account-email-form.component.scss',
})
export class AccountEmailFormComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);

  private readonly currentEmail = computed(() => this.workspace.currentUser()?.email ?? '');
  private readonly draft = linkedSignal<EmailDraft>(() => ({ email: this.currentEmail() }));

  protected readonly emailForm = form(
    this.draft,
    (path) => {
      validate(path.email, ({ value }) => emailError(value()));
    },
    {
      submission: {
        action: async () => this.sendConfirmation(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  private sendConfirmation(): void {
    this.toasts.show(`Confirmation sent to ${this.draft().email.trim()}`, { icon: 'mail' });
  }
}
