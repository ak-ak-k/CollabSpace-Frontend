import { Component, inject } from '@angular/core';
import { ThemePreference, ThemeState } from '../../../core/state/theme.state';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

interface ThemeCard {
  readonly value: ThemePreference;
  readonly label: string;
  readonly icon: IconName;
}

const THEME_CARDS: readonly ThemeCard[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'Match system', icon: 'monitor' },
];

@Component({
  selector: 'app-theme-picker',
  imports: [IconComponent],
  templateUrl: './theme-picker.component.html',
  styleUrl: './theme-picker.component.scss',
})
export class ThemePickerComponent {
  private readonly theme = inject(ThemeState);

  protected readonly cards = THEME_CARDS;
  protected readonly preference = this.theme.preference;

  protected choose(value: ThemePreference): void {
    this.theme.setPreference(value);
  }
}
