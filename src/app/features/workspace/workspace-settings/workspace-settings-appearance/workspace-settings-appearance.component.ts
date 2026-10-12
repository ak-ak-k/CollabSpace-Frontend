import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Density } from '../../../../core/models/preferences';
import { WorkspaceThemeDefault } from '../../../../core/models/workspace';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import {
  RadioGroupComponent,
  RadioOption,
} from '../../../../shared/ui/radio/radio-group.component';
import { SettingRowComponent } from '../../../settings/setting-row/setting-row.component';
import { preferenceControl } from '../preference-control';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';
import { WorkspaceSettingsNoteComponent } from '../workspace-settings-note/workspace-settings-note.component';

const THEME_OPTIONS: readonly RadioOption[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'Match system', icon: 'monitor' },
];

const DENSITY_OPTIONS: readonly RadioOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const themeOf = (value: string): WorkspaceThemeDefault =>
  value === 'light' || value === 'dark' ? value : 'system';

const densityOf = (value: string): Density => (value === 'compact' ? 'compact' : 'comfortable');

const labelOf = (options: readonly RadioOption[], value: string): string =>
  (options.find((option) => option.value === value)?.label ?? value).toLowerCase();

@Component({
  selector: 'app-workspace-settings-appearance',
  imports: [RouterLink, RadioGroupComponent, SettingRowComponent, WorkspaceSettingsNoteComponent],
  templateUrl: './workspace-settings-appearance.component.html',
  styleUrl: './workspace-settings-appearance.component.scss',
})
export class WorkspaceSettingsAppearanceComponent {
  private readonly updates = inject(WorkspacePreferenceUpdates);

  protected readonly preferences = inject(WorkspaceState).preferences;
  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly densityOptions = DENSITY_OPTIONS;
  protected readonly theme = preferenceControl<string>(
    () => this.preferences()?.defaultTheme ?? '',
  );
  protected readonly density = preferenceControl<string>(
    () => this.preferences()?.defaultDensity ?? '',
  );

  protected setTheme(value: string): void {
    const defaultTheme = themeOf(value);
    this.updates.set(
      { defaultTheme },
      `Default theme: ${labelOf(THEME_OPTIONS, defaultTheme)}`,
      this.theme.reset,
    );
  }

  protected setDensity(value: string): void {
    const defaultDensity = densityOf(value);
    this.updates.set(
      { defaultDensity },
      `Default density: ${labelOf(DENSITY_OPTIONS, defaultDensity)}`,
      this.density.reset,
    );
  }
}
