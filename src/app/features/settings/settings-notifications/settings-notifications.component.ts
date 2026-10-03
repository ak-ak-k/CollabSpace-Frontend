import { Component, computed, inject } from '@angular/core';
import {
  NOTIFICATION_CHANNELS,
  NotificationChannel,
  NotificationTopic,
} from '../../../core/models/preferences';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { ToggleComponent } from '../../../shared/ui/toggle/toggle.component';
import { PreferenceToggles } from '../preference-toggles.service';
import { SettingSwitchComponent } from '../setting-switch/setting-switch.component';

interface TopicCopy {
  readonly topic: NotificationTopic;
  readonly label: string;
  readonly description: string;
}

const TOPICS: readonly TopicCopy[] = [
  { topic: 'mentions', label: 'Mentions', description: '@you and @here in channels' },
  { topic: 'dms', label: 'Direct messages', description: 'New DMs and group messages' },
  { topic: 'tasks', label: 'Tasks', description: 'Assignments, due dates and comments' },
  { topic: 'team', label: 'Team activity', description: 'New channels, members and files' },
  { topic: 'system', label: 'System', description: 'Security alerts and maintenance' },
];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  email: 'Email',
};

@Component({
  selector: 'app-settings-notifications',
  imports: [TableComponent, ToggleComponent, SettingSwitchComponent],
  templateUrl: './settings-notifications.component.html',
  styleUrl: './settings-notifications.component.scss',
})
export class SettingsNotificationsComponent {
  private readonly state = inject(PreferencesState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toggles = inject(PreferenceToggles);
  private readonly toasts = inject(ToastService);

  protected readonly topics = TOPICS;
  protected readonly channels = NOTIFICATION_CHANNELS;
  protected readonly channelLabels = CHANNEL_LABELS;
  protected readonly preferences = this.state.preferences;
  protected readonly doNotDisturb = computed(() => this.workspace.currentUser()?.status === 'dnd');

  protected setChannel(topic: NotificationTopic, channel: NotificationChannel, on: boolean): void {
    void this.state.setNotification(topic, channel, on);
  }

  protected setSounds(on: boolean): void {
    this.toggles.set('sounds', on, 'Sounds');
  }

  protected setEnterToSend(on: boolean): void {
    this.toggles.set('enterToSend', on, 'Enter to send');
  }

  protected setDoNotDisturb(on: boolean): void {
    void this.workspace.setPresence(on ? 'dnd' : 'online');
    void this.state.update({ doNotDisturb: on });
    this.toasts.show(`Status set to ${on ? 'Do not disturb' : 'Online'}`, { icon: 'circle-check' });
  }
}
