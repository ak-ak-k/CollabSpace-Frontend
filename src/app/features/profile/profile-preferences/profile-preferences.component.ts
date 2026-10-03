import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeFormat } from '../../../core/models/preferences';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { ThemePreference, ThemeState } from '../../../core/state/theme.state';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { LANGUAGE_OPTIONS } from '../profile-view';

const THEME_OPTIONS: readonly RadioOption[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];

const TIME_FORMAT_OPTIONS: readonly RadioOption[] = [
  { value: '12-hour', label: '12-hour' },
  { value: '24-hour', label: '24-hour' },
];

const themeOf = (value: string): ThemePreference | null =>
  value === 'light' || value === 'dark' || value === 'system' ? value : null;

const timeFormatOf = (value: string): TimeFormat => (value === '24-hour' ? '24-hour' : '12-hour');

@Component({
  selector: 'app-profile-preferences',
  imports: [RouterLink, IconComponent, RadioGroupComponent, SelectComponent],
  templateUrl: './profile-preferences.component.html',
  styleUrl: './profile-preferences.component.scss',
})
export class ProfilePreferencesComponent {
  private readonly theme = inject(ThemeState);
  private readonly preferences = inject(PreferencesState);
  private readonly toasts = inject(ToastService);

  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly timeFormatOptions = TIME_FORMAT_OPTIONS;
  protected readonly languageOptions = LANGUAGE_OPTIONS;
  protected readonly themePreference = this.theme.preference;
  protected readonly timeFormat = computed(() => this.preferences.preferences().timeFormat);
  protected readonly language = computed(() => this.preferences.preferences().language);

  protected setTheme(value: string): void {
    const preference = themeOf(value);
    if (preference) {
      this.theme.setPreference(preference);
    }
  }

  protected setTimeFormat(value: string): void {
    void this.preferences.update({ timeFormat: timeFormatOf(value) });
  }

  protected setLanguage(language: string): void {
    void this.preferences.update({ language });
    this.toasts.show(`Language set to ${language}`, { icon: 'languages' });
  }
}
