import { inject, InjectionToken, Service } from '@angular/core';
import { DataModeState } from '../state/data-mode.state';

export interface MockLatency {
  readonly minimum: number;
  readonly maximum: number;
}

export const MOCK_LATENCY = new InjectionToken<MockLatency>('MOCK_LATENCY', {
  factory: () => ({ minimum: 300, maximum: 600 }),
});

export class MockRequestError extends Error {
  constructor() {
    super('The mock data service was told to fail.');
  }
}

@Service()
export class MockRequest {
  private readonly dataMode = inject(DataModeState);
  private readonly latency = inject(MOCK_LATENCY);

  async read<T>(produce: () => T, emptyValue: T): Promise<T> {
    const mode = this.dataMode.mode();
    if (mode === 'loading') {
      return new Promise<T>(() => undefined);
    }
    await this.wait();
    if (mode === 'error') {
      throw new MockRequestError();
    }
    return mode === 'empty' ? emptyValue : produce();
  }

  async write<T>(apply: () => T): Promise<T> {
    await this.wait();
    return apply();
  }

  private wait(): Promise<void> {
    const { minimum, maximum } = this.latency;
    const delay = minimum + Math.random() * (maximum - minimum);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
