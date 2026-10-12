import { TestBed } from '@angular/core/testing';
import { needsConnectionMessage, OFFLINE_FORM_MESSAGE } from '../models/connection-actions';
import { NetworkState } from '../state/network.state';
import { ConnectionGuard } from './connection-guard.service';
import { ToastService } from './toast.service';

describe('ConnectionGuard', () => {
  const setup = (offline: boolean) => {
    TestBed.inject(NetworkState).simulateOffline(offline);
    return { guard: TestBed.inject(ConnectionGuard), toasts: TestBed.inject(ToastService) };
  };

  it('lets actions through while online without a toast', () => {
    const { guard, toasts } = setup(false);

    expect(guard.allows('setRole')).toBe(true);
    expect(guard.allowsSave()).toBe(true);
    expect(toasts.toasts()).toEqual([]);
  });

  it('refuses actions with no offline queue and names them', () => {
    const { guard, toasts } = setup(true);

    expect(guard.allows('renameFile')).toBe(false);
    expect(toasts.toasts()[0]).toMatchObject({
      message: 'Renaming a file needs a connection — try again when you’re back online',
      icon: 'cloud-off',
    });
  });

  it('keeps form changes and re-checks confirms when the network drops', () => {
    const { guard, toasts } = setup(false);
    const recheck = guard.recheck('removeMember');

    TestBed.inject(NetworkState).simulateOffline(true);

    expect(recheck()).toBe(false);
    expect(guard.allowsSave()).toBe(false);
    expect(toasts.toasts().map((toast) => toast.message)).toEqual([
      needsConnectionMessage('removeMember'),
      OFFLINE_FORM_MESSAGE,
    ]);
  });
});
