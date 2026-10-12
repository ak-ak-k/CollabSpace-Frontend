import { computed, DestroyRef, DOCUMENT, inject, isDevMode, Service, signal } from '@angular/core';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ToastService } from './toast.service';

export type UpdateActivation = 'reloading' | 'simulated';

const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

const isVersionReady = (event: VersionEvent): event is VersionReadyEvent =>
  event.type === 'VERSION_READY';

@Service()
export class AppUpdateService {
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly versionReady = signal(false);
  private readonly postponed = signal(false);
  private readonly simulated = signal(false);
  private checking = false;

  readonly canSimulate = isDevMode();
  readonly bannerVisible = computed(() => this.versionReady() && !this.postponed());

  start(): void {
    const updates = this.updates;
    if (!updates?.isEnabled) {
      return;
    }
    updates.versionUpdates.pipe(filter(isVersionReady)).subscribe(() => this.announce(false));
    updates.unrecoverable.subscribe(() => this.offerRecovery());
    const checkWhenVisible = () => this.checkWhenVisible();
    const timer = setInterval(() => void this.checkForUpdate(), UPDATE_CHECK_INTERVAL);
    this.document.addEventListener('visibilitychange', checkWhenVisible);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('visibilitychange', checkWhenVisible);
      clearInterval(timer);
    });
  }

  simulate(): void {
    if (this.canSimulate) {
      this.announce(true);
    }
  }

  postpone(): void {
    this.postponed.set(true);
  }

  async activate(): Promise<UpdateActivation> {
    if (this.simulated() || !this.updates?.isEnabled) {
      this.versionReady.set(false);
      this.simulated.set(false);
      return 'simulated';
    }
    await this.updates.activateUpdate().catch(() => false);
    this.document.location.reload();
    return 'reloading';
  }

  private announce(simulated: boolean): void {
    this.simulated.set(simulated);
    this.versionReady.set(true);
    this.postponed.set(false);
  }

  private checkWhenVisible(): void {
    if (this.document.visibilityState === 'visible') {
      void this.checkForUpdate();
    }
  }

  private async checkForUpdate(): Promise<void> {
    if (this.checking || !this.updates?.isEnabled) {
      return;
    }
    this.checking = true;
    await this.updates.checkForUpdate().catch(() => false);
    this.checking = false;
  }

  private offerRecovery(): void {
    this.toasts.show('CollabSpace needs to reload to keep working offline', {
      icon: 'refresh-cw',
      actionLabel: 'Reload',
      onAction: () => this.document.location.reload(),
      persistent: true,
    });
  }
}
