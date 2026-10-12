import { computed, DOCUMENT, inject, Service, signal } from '@angular/core';

@Service()
export class NetworkState {
  private readonly window = inject(DOCUMENT).defaultView;

  private readonly browserOnline = signal(this.window?.navigator.onLine ?? true);

  readonly simulatedOffline = signal(false);
  readonly simulatedSyncFailure = signal(false);
  readonly online = computed(() => this.browserOnline() && !this.simulatedOffline());
  readonly offline = computed(() => !this.online());

  constructor() {
    this.window?.addEventListener('online', () => this.browserOnline.set(true));
    this.window?.addEventListener('offline', () => this.browserOnline.set(false));
  }

  simulateOffline(offline: boolean): void {
    this.simulatedOffline.set(offline);
  }

  toggleSimulatedOffline(): void {
    this.simulatedOffline.update((offline) => !offline);
  }

  simulateSyncFailure(failing: boolean): void {
    this.simulatedSyncFailure.set(failing);
  }

  toggleSimulatedSyncFailure(): void {
    this.simulatedSyncFailure.update((failing) => !failing);
  }

  retry(): boolean {
    if (this.window?.navigator.onLine ?? true) {
      this.simulatedOffline.set(false);
      this.browserOnline.set(true);
    }
    return this.online();
  }
}
