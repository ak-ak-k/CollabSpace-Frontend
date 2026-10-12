import { linkedSignal, WritableSignal } from '@angular/core';

export interface PreferenceControl<T> {
  readonly value: WritableSignal<T>;
  readonly reset: () => void;
}

export const preferenceControl = <T>(saved: () => T): PreferenceControl<T> => {
  const value = linkedSignal(saved);
  return { value, reset: () => value.set(saved()) };
};
