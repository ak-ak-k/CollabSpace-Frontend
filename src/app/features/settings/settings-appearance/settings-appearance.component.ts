import { Component, inject } from '@angular/core';
import { Density } from '../../../core/models/preferences';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { PreferenceToggles } from '../preference-toggles.service';
import { SettingSwitchComponent } from '../setting-switch/setting-switch.component';
import { ThemePickerComponent } from '../theme-picker/theme-picker.component';

const DENSITY_OPTIONS: readonly RadioOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const densityOf = (value: string): Density => (value === 'compact' ? 'compact' : 'comfortable');

@Component({
  selector: 'app-settings-appearance',
  imports: [RadioGroupComponent, SettingSwitchComponent, ThemePickerComponent],
  templateUrl: './settings-appearance.component.html',
  styleUrl: './settings-appearance.component.scss',
})
export class SettingsAppearanceComponent {
  private readonly state = inject(PreferencesState);
  private readonly toggles = inject(PreferenceToggles);
  private readonly toasts = inject(ToastService);

  protected readonly densityOptions = DENSITY_OPTIONS;
  protected readonly preferences = this.state.preferences;

  protected setDensity(value: string): void {
    const density = densityOf(value);
    const label = DENSITY_OPTIONS.find((option) => option.value === density)?.label ?? value;
    void this.state.update({ density });
    this.toasts.show(`${label} density`, { icon: 'sliders-horizontal' });
  }

  protected setReduceMotion(on: boolean): void {
    this.toggles.set('reduceMotion', on, 'Reduced motion');
  }
}
