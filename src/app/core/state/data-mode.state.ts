import { isDevMode, Service, signal } from '@angular/core';
import { DataMode } from '../models/load-status';

export interface DataModeOption {
  readonly mode: DataMode;
  readonly label: string;
}

export const DATA_MODE_OPTIONS: readonly DataModeOption[] = [
  { mode: 'live', label: 'Live data' },
  { mode: 'loading', label: 'Force loading' },
  { mode: 'empty', label: 'Force empty' },
  { mode: 'error', label: 'Force error' },
];

@Service()
export class DataModeState {
  readonly available = isDevMode();
  readonly mode = signal<DataMode>('live');

  setMode(mode: DataMode): void {
    this.mode.set(this.available ? mode : 'live');
  }
}
