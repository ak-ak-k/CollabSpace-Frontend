import { computed, DestroyRef, DOCUMENT, inject, Service, signal } from '@angular/core';

export type InstallOutcome = 'accepted' | 'dismissed';

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ readonly outcome: InstallOutcome }>;
}

const isInstallPrompt = (event: Event): event is InstallPromptEvent =>
  'prompt' in event && 'userChoice' in event;

@Service()
export class InstallState {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly deferredPrompt = signal<InstallPromptEvent | null>(null);

  readonly canInstall = computed(() => this.deferredPrompt() !== null);

  constructor() {
    const keepPrompt = (event: Event) => this.keepPrompt(event);
    const forgetPrompt = () => this.deferredPrompt.set(null);
    this.window?.addEventListener('beforeinstallprompt', keepPrompt);
    this.window?.addEventListener('appinstalled', forgetPrompt);
    inject(DestroyRef).onDestroy(() => {
      this.window?.removeEventListener('beforeinstallprompt', keepPrompt);
      this.window?.removeEventListener('appinstalled', forgetPrompt);
    });
  }

  async install(): Promise<InstallOutcome | null> {
    const prompt = this.deferredPrompt();
    if (!prompt) {
      return null;
    }
    this.deferredPrompt.set(null);
    await prompt.prompt();
    return (await prompt.userChoice).outcome;
  }

  private keepPrompt(event: Event): void {
    if (isInstallPrompt(event)) {
      event.preventDefault();
      this.deferredPrompt.set(event);
    }
  }
}
