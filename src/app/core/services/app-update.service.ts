import { DOCUMENT, inject, Service } from '@angular/core';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ToastService } from './toast.service';

const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

const isVersionReady = (event: VersionEvent): event is VersionReadyEvent =>
  event.type === 'VERSION_READY';

@Service()
export class AppUpdateService {
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  start(): void {
    const updates = this.updates;
    if (!updates?.isEnabled) {
      return;
    }
    updates.versionUpdates
      .pipe(filter(isVersionReady))
      .subscribe(() => this.offerReload('A new version of CollabSpace is ready'));
    updates.unrecoverable.subscribe(() =>
      this.offerReload('CollabSpace needs to reload to keep working offline'),
    );
    setInterval(() => void updates.checkForUpdate(), UPDATE_CHECK_INTERVAL);
  }

  private offerReload(message: string): void {
    this.toasts.show(message, {
      icon: 'refresh-cw',
      actionLabel: 'Reload',
      onAction: () => this.document.location.reload(),
      persistent: true,
    });
  }
}
