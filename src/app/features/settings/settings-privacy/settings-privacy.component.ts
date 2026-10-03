import { Component, inject } from '@angular/core';
import { BooleanPreference } from '../../../core/models/preferences';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { PreferenceToggles } from '../preference-toggles.service';
import { SettingSwitchComponent } from '../setting-switch/setting-switch.component';

interface PrivacySwitch {
  readonly key: BooleanPreference;
  readonly label: string;
  readonly description: string;
  readonly toastLabel: string;
}

const PRIVACY_SWITCHES: readonly PrivacySwitch[] = [
  {
    key: 'showStatus',
    label: 'Show when I’m online',
    description: 'Others see a green square next to your name.',
    toastLabel: 'Online status',
  },
  {
    key: 'readReceipts',
    label: 'Read receipts',
    description: 'Let people know when you’ve read their direct messages.',
    toastLabel: 'Read receipts',
  },
  {
    key: 'typingIndicators',
    label: 'Typing indicators',
    description: 'Show “typing…” while you write a message.',
    toastLabel: 'Typing indicators',
  },
];

const VISIBILITY_OPTIONS: readonly SelectOption[] = [
  'Everyone in the workspace',
  'Only my teams',
  'Only admins',
].map((label) => ({ value: label, label }));

@Component({
  selector: 'app-settings-privacy',
  imports: [SelectComponent, SettingSwitchComponent],
  templateUrl: './settings-privacy.component.html',
  styleUrl: './settings-privacy.component.scss',
})
export class SettingsPrivacyComponent {
  private readonly state = inject(PreferencesState);
  private readonly toggles = inject(PreferenceToggles);
  private readonly toasts = inject(ToastService);

  protected readonly switches = PRIVACY_SWITCHES;
  protected readonly visibilityOptions = VISIBILITY_OPTIONS;
  protected readonly preferences = this.state.preferences;

  protected setSwitch(item: PrivacySwitch, on: boolean): void {
    this.toggles.set(item.key, on, item.toastLabel);
  }

  protected setVisibility(profileVisibility: string): void {
    void this.state.update({ profileVisibility });
    this.toasts.show(`Profile visible to: ${profileVisibility}`, { icon: 'eye' });
  }
}
