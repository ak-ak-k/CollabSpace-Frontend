import { inject, Service } from '@angular/core';
import { BooleanPreference } from '../../core/models/preferences';
import { ToastService } from '../../core/services/toast.service';
import { PreferencesState } from '../../core/state/preferences.state';

export const switchedLabelOf = (label: string, on: boolean): string =>
  `${label} turned ${on ? 'on' : 'off'}`;

@Service()
export class PreferenceToggles {
  private readonly preferences = inject(PreferencesState);
  private readonly toasts = inject(ToastService);

  set(key: BooleanPreference, on: boolean, toastLabel: string): void {
    void this.preferences.update({ [key]: on });
    this.toasts.show(switchedLabelOf(toastLabel, on), { icon: 'circle-check' });
  }
}
