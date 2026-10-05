import { Component, computed, inject } from '@angular/core';
import {
  NOTIFICATION_CHANNEL_LABELS,
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
  { topic: 'mentions', label: 'Mentions', description: '@you, @here and @everyone' },
  { topic: 'dms', label: 'Direct messages', description: 'New messages in DMs and groups' },
  { topic: 'threads', label: 'Thread replies', description: 'Replies in threads you’re part of' },
  {
    topic: 'tasks',
    label: 'Task assignments & mentions',
    description: 'Assigned to you, or mentioned in a comment',
  },
  { topic: 'due', label: 'Due reminders', description: 'Your tasks due soon or overdue' },
  {
    topic: 'team',
    label: 'Teams & workspace',
    description: 'Added to a team or private channel, role changes',
  },
  { topic: 'system', label: 'Security & system', description: 'New sign-ins and account security' },
];

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
  protected readonly channelLabels = NOTIFICATION_CHANNEL_LABELS;
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
