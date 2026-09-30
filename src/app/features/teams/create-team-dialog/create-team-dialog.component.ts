import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import { TeamPrivacy } from '../../../core/models/team';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

interface TeamDraft {
  readonly name: string;
  readonly description: string;
  readonly privacy: string;
}

const TEAM_NAME_MAX_LENGTH = 40;
const TEAM_DESCRIPTION_MAX_LENGTH = 160;

const PRIVACY_OPTIONS: readonly RadioOption[] = [
  { value: 'public', label: 'Public', icon: 'globe' },
  { value: 'private', label: 'Private', icon: 'lock' },
];

const privacyOf = (value: string): TeamPrivacy => (value === 'private' ? 'private' : 'public');

@Component({
  selector: 'app-create-team-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    InputComponent,
    TextareaComponent,
    RadioGroupComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './create-team-dialog.component.html',
  styleUrl: './create-team-dialog.component.scss',
})
export class CreateTeamDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly nameMaxLength = TEAM_NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = TEAM_DESCRIPTION_MAX_LENGTH;
  protected readonly privacyOptions = PRIVACY_OPTIONS;

  private readonly draft = signal<TeamDraft>({ name: '', description: '', privacy: 'public' });

  protected readonly privacyHelp = computed(() => {
    const workspaceName = this.workspace.currentWorkspace()?.name ?? 'your workspace';
    return this.draft().privacy === 'private'
      ? 'Only people you invite can find this team and see its channels.'
      : `Anyone in ${workspaceName} can find and join this team.`;
  });

  protected readonly teamForm = form(
    this.draft,
    (path) => {
      required(path.name, { message: 'Give the team a name.' });
      maxLength(path.name, TEAM_NAME_MAX_LENGTH);
      maxLength(path.description, TEAM_DESCRIPTION_MAX_LENGTH);
      validate(path.name, ({ value }) => this.duplicateNameError(value()));
    },
    {
      submission: {
        action: async () => this.create(),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  private duplicateNameError(value: string): ValidationError | undefined {
    const name = value.trim();
    const taken = this.workspace
      .teams()
      .some((team) => name !== '' && team.name.toLowerCase() === name.toLowerCase());
    return taken
      ? { kind: 'duplicateTeam', message: `A team called “${name}” already exists.` }
      : undefined;
  }

  private async create(): Promise<void> {
    const name = this.draft().name.trim();
    const { team, channel } = await this.workspace.createTeam({
      name,
      description: this.draft().description.trim(),
      privacy: privacyOf(this.draft().privacy),
    });
    this.chat.addChannel(channel);
    this.dialogRef.close();
    await this.router.navigate(['/teams', team.id]);
    this.toasts.show(`Team “${name}” created — #general is ready`, { icon: 'users' });
  }
}
