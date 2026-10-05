import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, validate } from '@angular/forms/signals';
import { Channel } from '../../../core/models/channel';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { ChannelNameFieldComponent } from '../../teams/create-channel-dialog/channel-name-field/channel-name-field.component';
import {
  CHANNEL_DESCRIPTION_MAX_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  channelNameError,
  channelPrivacyHelp,
} from '../../teams/create-channel-dialog/channel-rules';

export interface EditChannelDialogData {
  readonly channel: Channel;
}

interface ChannelDraft {
  readonly name: string;
  readonly description: string;
  readonly privacy: string;
}

const PRIVACY_OPTIONS: readonly RadioOption[] = [
  { value: 'public', label: 'Public', icon: 'globe' },
  { value: 'private', label: 'Private', icon: 'lock' },
];

@Component({
  selector: 'app-edit-channel-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    ChannelNameFieldComponent,
    TextareaComponent,
    RadioGroupComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss',
})
export class EditChannelDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly channel = inject<EditChannelDialogData>(DIALOG_DATA).channel;
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly toasts = inject(ToastService);

  protected readonly nameMaxLength = CHANNEL_NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = CHANNEL_DESCRIPTION_MAX_LENGTH;
  protected readonly privacyOptions = PRIVACY_OPTIONS;
  protected readonly teamName = computed(
    () => this.workspace.team(this.channel.teamId)?.name ?? '',
  );

  private readonly otherChannels = computed(() =>
    this.workspace.channels().filter((candidate) => candidate.id !== this.channel.id),
  );

  private readonly draft = signal<ChannelDraft>({
    name: this.channel.name,
    description: this.channel.description,
    privacy: this.channel.isPrivate ? 'private' : 'public',
  });

  protected readonly privacyHelp = computed(() =>
    channelPrivacyHelp(this.draft().privacy === 'private', this.draft().name),
  );

  protected readonly channelForm = form(
    this.draft,
    (path) => {
      maxLength(path.name, CHANNEL_NAME_MAX_LENGTH);
      maxLength(path.description, CHANNEL_DESCRIPTION_MAX_LENGTH);
      validate(path.name, ({ value }) => {
        const team = this.workspace.team(this.channel.teamId);
        const message = channelNameError(value(), team, this.otherChannels());
        return message ? { kind: 'channelName', message } : undefined;
      });
    },
    {
      submission: {
        action: async () => this.save(),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  private async save(): Promise<void> {
    const { name, description, privacy } = this.draft();
    const updated = await this.workspace.updateChannel(this.channel.id, {
      name,
      description: description.trim(),
      isPrivate: privacy === 'private',
    });
    this.chat.syncChannel(updated);
    this.dialogRef.close();
    this.toasts.show(`#${name} updated`, { icon: 'hash' });
  }
}
