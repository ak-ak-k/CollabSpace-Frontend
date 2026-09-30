import { TestBed } from '@angular/core/testing';
import { NetworkState } from './network.state';

describe('NetworkState', () => {
  it('goes offline when simulated and recovers on retry', () => {
    const network = TestBed.inject(NetworkState);

    network.simulateOffline(true);
    expect(network.offline()).toBe(true);

    expect(network.retry()).toBe(true);
    expect(network.online()).toBe(true);
  });

  it('follows the browser connection events', () => {
    const network = TestBed.inject(NetworkState);

    window.dispatchEvent(new Event('offline'));
    expect(network.offline()).toBe(true);

    window.dispatchEvent(new Event('online'));
    expect(network.online()).toBe(true);
  });
});
