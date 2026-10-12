import { computed, Signal, signal } from '@angular/core';
import { LoadStatus } from '../models/load-status';

export interface LoadableOptions<T> {
  readonly fetch: () => Promise<T>;
  readonly store: (value: T) => void;
  readonly isEmpty: (value: T) => boolean;
}

export class Loadable<T> {
  readonly status = signal<LoadStatus>('loading');

  private latestRequest = 0;

  constructor(private readonly options: LoadableOptions<T>) {}

  async load(): Promise<void> {
    const request = ++this.latestRequest;
    this.status.set('loading');
    try {
      const value = await this.options.fetch();
      if (request === this.latestRequest) {
        this.options.store(value);
        this.status.set(this.options.isEmpty(value) ? 'empty' : 'ready');
      }
    } catch {
      if (request === this.latestRequest) {
        this.status.set('error');
      }
    }
  }
}

export const settledStatus = (
  status: Signal<LoadStatus>,
  isEmpty: () => boolean,
): Signal<LoadStatus> =>
  computed(() => {
    const value = status();
    if (value !== 'ready' && value !== 'empty') {
      return value;
    }
    return isEmpty() ? 'empty' : 'ready';
  });

export const loadingWhile = (
  status: Signal<LoadStatus>,
  busy: Signal<boolean>,
): Signal<LoadStatus> => computed(() => (busy() ? 'loading' : status()));
