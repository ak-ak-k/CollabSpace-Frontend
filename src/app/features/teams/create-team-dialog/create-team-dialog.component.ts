import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
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
import { Team, TeamPrivacy } from '../../../core/models/team';
import { ConnectionGuard } from '../../../core/services/connection-guard.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';
import { TeamMembershipState } from '../../../core/state/team-membership.state';
import { teamCreatedEntry } from '../../../core/state/team-activity';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { TeamAdminActions } from '../team-admin-actions.service';
import { TEAM_DIALOG_COPY } from './team-dialog-copy';

export interface TeamDialogData {
  readonly teamId?: string;
}

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

const draftOf = (team: Team | null): TeamDraft => ({
  name: team?.name ?? '',
  description: team?.description ?? '',
  privacy: team?.isPrivate ? 'private' : 'public',
});

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
  private readonly data = inject<TeamDialogData | null>(DIALOG_DATA, { optional: true });
  private readonly workspace = inject(WorkspaceState);
  private readonly membership = inject(TeamMembershipState);
  private readonly admin = inject(TeamAdminActions);
  private readonly chat = inject(ChatState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly connection = inject(ConnectionGuard);

  private readonly editedTeam = this.workspace.team(this.data?.teamId ?? '');

  protected readonly nameMaxLength = TEAM_NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = TEAM_DESCRIPTION_MAX_LENGTH;
  protected readonly privacyOptions = PRIVACY_OPTIONS;
  protected readonly editing = this.editedTeam !== null;
  protected readonly copy = TEAM_DIALOG_COPY[this.editing ? 'edit' : 'create'];
  protected readonly archiving = signal(false);

  private readonly draft = signal<TeamDraft>(draftOf(this.editedTeam));

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
        action: async () => {
          if (this.connection.allowsSave()) {
            await (this.editedTeam ? this.save(this.editedTeam) : this.create());
          }
        },
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async archive(): Promise<void> {
    if (!this.editedTeam) {
      return;
    }
    this.archiving.set(true);
    const archived = await this.admin.archive(this.editedTeam.id);
    this.archiving.set(false);
    if (archived) {
      this.dialogRef.close();
    }
  }

  private duplicateNameError(value: string): ValidationError | undefined {
    const name = value.trim();
    const taken = this.workspace
      .teams()
      .some(
        (team) =>
          team.id !== this.editedTeam?.id &&
          name !== '' &&
          team.name.toLowerCase() === name.toLowerCase(),
      );
    return taken
      ? { kind: 'duplicateTeam', message: `A team called “${name}” already exists.` }
      : undefined;
  }

  private async save(team: Team): Promise<void> {
    await this.membership.updateTeam(team.id, {
      name: this.draft().name.trim(),
      description: this.draft().description.trim(),
      isPrivate: privacyOf(this.draft().privacy) === 'private',
    });
    this.dialogRef.close();
    this.toasts.show('Team settings saved', { icon: 'circle-check' });
  }

  private async create(): Promise<void> {
    const name = this.draft().name.trim();
    const { team, channel } = await this.workspace.createTeam({
      name,
      description: this.draft().description.trim(),
      privacy: privacyOf(this.draft().privacy),
    });
    this.chat.addChannel(channel);
    this.activity.record(teamCreatedEntry(team));
    this.dialogRef.close();
    await this.router.navigate(['/teams', team.id]);
    this.toasts.show(`Team “${name}” created — #general is ready`, { icon: 'users' });
    void this.admin.addMembers(team.id);
  }
}
