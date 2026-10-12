import { computed, DestroyRef, DOCUMENT, inject, Service, signal } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { isIosSafari, isStandaloneDisplay, standaloneQueryOf } from './install-environment';

export type InstallOutcome = 'accepted' | 'dismissed';

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ readonly outcome: InstallOutcome }>;
}

export const INSTALL_DISMISSED_STORAGE_KEY = 'collabspace.install-dismissed';
export const INSTALLED_MESSAGE = 'CollabSpace is installed — open it from your apps';

const isInstallPrompt = (event: Event): event is InstallPromptEvent =>
  'prompt' in event && 'userChoice' in event;

@Service()
export class InstallState {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly toasts = inject(ToastService);

  private readonly deferredPrompt = signal<InstallPromptEvent | null>(null);
  private readonly iosSafari = this.window ? isIosSafari(this.window.navigator) : false;

  private readonly installedApp = signal(this.runsStandalone());

  readonly installed = this.installedApp.asReadonly();
  readonly canInstall = computed(() => this.deferredPrompt() !== null && !this.installed());
  readonly canAddToHomeScreen = computed(
    () => this.iosSafari && !this.installed() && this.deferredPrompt() === null,
  );

  constructor() {
    const keepPrompt = (event: Event) => this.keepPrompt(event);
    const markInstalled = () => this.markInstalled();
    const followDisplay = () => this.installedApp.set(this.runsStandalone());
    const standaloneQuery = this.window ? standaloneQueryOf(this.window) : null;
    this.window?.addEventListener('beforeinstallprompt', keepPrompt);
    this.window?.addEventListener('appinstalled', markInstalled);
    standaloneQuery?.addEventListener('change', followDisplay);
    inject(DestroyRef).onDestroy(() => {
      this.window?.removeEventListener('beforeinstallprompt', keepPrompt);
      this.window?.removeEventListener('appinstalled', markInstalled);
      standaloneQuery?.removeEventListener('change', followDisplay);
    });
  }

  async install(): Promise<InstallOutcome | null> {
    const prompt = this.deferredPrompt();
    if (!prompt) {
      return null;
    }
    this.deferredPrompt.set(null);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'dismissed') {
      this.rememberDismissal();
    }
    return outcome;
  }

  private keepPrompt(event: Event): void {
    if (!isInstallPrompt(event)) {
      return;
    }
    event.preventDefault();
    if (!this.runsStandalone()) {
      this.deferredPrompt.set(event);
    }
  }

  private markInstalled(): void {
    this.deferredPrompt.set(null);
    this.installedApp.set(true);
    this.toasts.show(INSTALLED_MESSAGE, { icon: 'circle-check' });
  }

  private runsStandalone(): boolean {
    return this.window ? isStandaloneDisplay(this.window) : false;
  }

  private rememberDismissal(): void {
    try {
      this.window?.localStorage.setItem(INSTALL_DISMISSED_STORAGE_KEY, String(Date.now()));
    } catch {
      return;
    }
  }
}
