import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService } from './app-update.service';
import { ToastService } from './toast.service';

const provideServiceWorker = () => {
  const versionUpdates = new Subject<{ type: string }>();
  const checkForUpdate = vi.fn(() => Promise.resolve(false));
  TestBed.configureTestingModule({
    providers: [
      {
        provide: SwUpdate,
        useValue: { isEnabled: true, versionUpdates, unrecoverable: new Subject(), checkForUpdate },
      },
    ],
  });
  return { versionUpdates, checkForUpdate };
};

describe('AppUpdateService', () => {
  it('shows the update banner for each new version until postponed', () => {
    const { versionUpdates } = provideServiceWorker();
    const updates = TestBed.inject(AppUpdateService);
    updates.start();

    versionUpdates.next({ type: 'VERSION_READY' });
    expect(updates.bannerVisible()).toBe(true);
    expect(TestBed.inject(ToastService).toasts()).toEqual([]);

    updates.postpone();
    expect(updates.bannerVisible()).toBe(false);

    versionUpdates.next({ type: 'VERSION_READY' });
    expect(updates.bannerVisible()).toBe(true);
  });

  it('checks for a new version when the tab becomes visible again', () => {
    const { checkForUpdate } = provideServiceWorker();
    TestBed.inject(AppUpdateService).start();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });

    document.dispatchEvent(new Event('visibilitychange'));
    Reflect.deleteProperty(document, 'visibilityState');

    expect(checkForUpdate).toHaveBeenCalledOnce();
  });

  it('simulates an update in development without a service worker', async () => {
    const updates = TestBed.inject(AppUpdateService);
    updates.start();
    expect(updates.bannerVisible()).toBe(false);

    updates.simulate();
    expect(updates.bannerVisible()).toBe(true);

    await expect(updates.activate()).resolves.toBe('simulated');
    expect(updates.bannerVisible()).toBe(false);
  });
});
