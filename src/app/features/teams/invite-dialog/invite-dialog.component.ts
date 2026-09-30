import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { ToastService } from '../../../core/services/toast.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { emailListError, parseEmailList } from './email-list';

export interface InviteDialogData {
  readonly teamId?: string;
}

interface InviteDraft {
  readonly emails: string;
  readonly teamId: string;
  readonly role: string;
  readonly note: string;
}

const ROLE_OPTIONS: readonly RadioOption[] = [
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
  { value: 'admin', label: 'Admin' },
];

@Component({
  selector: 'app-invite-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    RadioGroupComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.scss',
})
export class InviteDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly data = inject<InviteDialogData | null>(DIALOG_DATA, { optional: true });
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);

  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly teamOptions = computed<readonly SelectOption[]>(() =>
    this.workspace.teams().map((team) => ({ value: team.id, label: team.name })),
  );
  protected readonly description = computed(
    () =>
      `They’ll get an email with a link to join ${this.workspace.currentWorkspace()?.name ?? 'your workspace'}.`,
  );

  private readonly draft = signal<InviteDraft>({
    emails: '',
    teamId: this.data?.teamId ?? this.workspace.teams()[0]?.id ?? '',
    role: 'member',
    note: '',
  });

  protected readonly inviteForm = form(
    this.draft,
    (path) => {
      validate(path.emails, ({ value }) => emailListError(value()));
    },
    {
      submission: {
        action: async () => this.sendInvites(),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  private sendInvites(): void {
    const emails = parseEmailList(this.draft().emails);
    const teamName = this.workspace.team(this.draft().teamId)?.name ?? '';
    const summary =
      emails.length === 1 ? `Invite sent to ${emails[0]}` : `${emails.length} invites sent`;
    this.dialogRef.close();
    this.toasts.show(`${summary} · ${teamName}`, { icon: 'send-horizontal' });
  }
}
