import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmailDigest, MemberNotificationDefault } from '../../../../core/models/workspace';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { createUniqueId } from '../../../../shared/ui/input/field/unique-id';
import {
  RadioGroupComponent,
  RadioOption,
} from '../../../../shared/ui/radio/radio-group.component';
import { SettingRowComponent } from '../../../settings/setting-row/setting-row.component';
import { SettingSwitchComponent } from '../../../settings/setting-switch/setting-switch.component';
import { preferenceControl } from '../preference-control';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';
import { WorkspaceSettingsNoteComponent } from '../workspace-settings-note/workspace-settings-note.component';

interface NotifyOption {
  readonly value: MemberNotificationDefault;
  readonly label: string;
  readonly description: string;
}

const NOTIFY_OPTIONS: readonly NotifyOption[] = [
  {
    value: 'all',
    label: 'All new messages',
    description: 'Every message in channels they’ve joined.',
  },
  {
    value: 'mentions',
    label: 'Mentions and direct messages',
    description: 'Recommended for most teams.',
  },
  { value: 'nothing', label: 'Nothing', description: 'Only the unread count updates.' },
];

const DIGEST_OPTIONS: readonly RadioOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'off', label: 'Off' },
];

const digestOf = (value: string): EmailDigest =>
  value === 'daily' || value === 'off' ? value : 'weekly';

@Component({
  selector: 'app-workspace-settings-notifications',
  imports: [
    RouterLink,
    RadioGroupComponent,
    SettingRowComponent,
    SettingSwitchComponent,
    WorkspaceSettingsNoteComponent,
  ],
  templateUrl: './workspace-settings-notifications.component.html',
  styleUrl: './workspace-settings-notifications.component.scss',
})
export class WorkspaceSettingsNotificationsComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly updates = inject(WorkspacePreferenceUpdates);

  protected readonly preferences = this.workspace.preferences;
  protected readonly workspaceName = computed(() => this.workspace.currentWorkspace()?.name ?? '');
  protected readonly notifyOptions = NOTIFY_OPTIONS;
  protected readonly digestOptions = DIGEST_OPTIONS;
  protected readonly groupName = createUniqueId('notify-default');
  protected readonly notifyDefault = preferenceControl<string>(
    () => this.preferences()?.notifyDefault ?? '',
  );
  protected readonly digest = preferenceControl<string>(() => this.preferences()?.digest ?? '');
  protected readonly allowEveryone = preferenceControl(
    () => this.preferences()?.allowEveryone ?? false,
  );

  protected setNotifyDefault(option: NotifyOption): void {
    this.notifyDefault.value.set(option.value);
    this.updates.set(
      { notifyDefault: option.value },
      `New members will be notified about: ${option.label.toLowerCase()}`,
      this.notifyDefault.reset,
    );
  }

  protected setDigest(value: string): void {
    const digest = digestOf(value);
    const label = DIGEST_OPTIONS.find((option) => option.value === digest)?.label ?? '';
    this.updates.set({ digest }, `Email digest: ${label.toLowerCase()}`, this.digest.reset);
  }

  protected setAllowEveryone(allowEveryone: boolean): void {
    this.updates.set(
      { allowEveryone },
      allowEveryone ? 'Everyone can use @everyone' : 'Only admins can use @everyone',
      this.allowEveryone.reset,
    );
  }
}
