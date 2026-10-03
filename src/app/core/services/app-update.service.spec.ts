import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService } from './app-update.service';
import { ToastService } from './toast.service';

describe('AppUpdateService', () => {
  it('offers a reload when a new version is ready', () => {
    const versionUpdates = new Subject<{ type: string }>();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates,
            unrecoverable: new Subject(),
            checkForUpdate: () => Promise.resolve(false),
          },
        },
      ],
    });
    TestBed.inject(AppUpdateService).start();

    versionUpdates.next({ type: 'VERSION_READY' });

    const toast = TestBed.inject(ToastService).toasts()[0];
    expect(toast?.message).toBe('A new version of CollabSpace is ready');
    expect(toast?.actionLabel).toBe('Reload');
  });

  it('does nothing when the service worker is not available', () => {
    TestBed.inject(AppUpdateService).start();

    expect(TestBed.inject(ToastService).toasts()).toEqual([]);
  });
});
