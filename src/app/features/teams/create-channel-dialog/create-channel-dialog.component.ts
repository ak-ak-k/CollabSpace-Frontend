import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, validate } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { ChannelNameFieldComponent } from './channel-name-field/channel-name-field.component';
import {
  CHANNEL_DESCRIPTION_MAX_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  channelNameError,
  channelPrivacyHelp,
} from './channel-rules';

export interface CreateChannelDialogData {
  readonly teamId: string | null;
}

export const CREATE_TEAM_FIRST = 'create-team';

export type CreateChannelDialogResult = typeof CREATE_TEAM_FIRST;

interface ChannelDraft {
  readonly name: string;
  readonly teamId: string;
  readonly description: string;
  readonly privacy: string;
}

const PRIVACY_OPTIONS: readonly RadioOption[] = [
  { value: 'public', label: 'Public', icon: 'globe' },
  { value: 'private', label: 'Private', icon: 'lock' },
];

@Component({
  selector: 'app-create-channel-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    ChannelNameFieldComponent,
    SelectComponent,
    TextareaComponent,
    RadioGroupComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
})
export class CreateChannelDialogComponent {
  private readonly dialogRef = inject<DialogRef<CreateChannelDialogResult>>(DialogRef);
  private readonly data = inject<CreateChannelDialogData | null>(DIALOG_DATA, { optional: true });
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly nameMaxLength = CHANNEL_NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = CHANNEL_DESCRIPTION_MAX_LENGTH;
  protected readonly privacyOptions = PRIVACY_OPTIONS;

  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'This workspace',
  );
  protected readonly noTeams = computed(() => this.workspace.teams().length === 0);
  protected readonly teamOptions = computed<readonly SelectOption[]>(() =>
    this.workspace.teams().map((team) => ({ value: team.id, label: team.name })),
  );

  private readonly draft = signal<ChannelDraft>({
    name: '',
    teamId: this.initialTeamId(),
    description: '',
    privacy: 'public',
  });

  protected readonly privacyHelp = computed(() =>
    channelPrivacyHelp(this.draft().privacy === 'private', this.draft().name),
  );

  protected readonly channelForm = form(
    this.draft,
    (path) => {
      maxLength(path.name, CHANNEL_NAME_MAX_LENGTH);
      maxLength(path.description, CHANNEL_DESCRIPTION_MAX_LENGTH);
      validate(path.name, ({ value, valueOf }) => {
        const message = channelNameError(
          value(),
          this.workspace.team(valueOf(path.teamId)),
          this.workspace.channels(),
        );
        return message ? { kind: 'channelName', message } : undefined;
      });
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

  protected createTeamFirst(): void {
    this.dialogRef.close(CREATE_TEAM_FIRST);
  }

  private initialTeamId(): string {
    const teams = this.workspace.teams();
    const requested = this.data?.teamId;
    return teams.find((team) => team.id === requested)?.id ?? teams[0]?.id ?? '';
  }

  private async create(): Promise<void> {
    const { name, teamId, description, privacy } = this.draft();
    const team = this.workspace.team(teamId);
    if (!team) {
      return;
    }
    const channel = await this.workspace.createChannel({
      teamId,
      name,
      description: description.trim(),
      isPrivate: privacy === 'private',
    });
    this.chat.addChannel(channel);
    const route = `/teams/${teamId}/c/${channel.id}`;
    this.activity.record({
      kind: 'channel',
      verb: 'created',
      object: `#${name} in ${team.name}`,
      route,
    });
    this.dialogRef.close();
    await this.router.navigateByUrl(route);
    this.toasts.show(`#${name} created`, { icon: 'hash' });
  }
}
