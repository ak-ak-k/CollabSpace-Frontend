import { TestBed } from '@angular/core/testing';
import { ToastService } from '../services/toast.service';
import { BrowserIdentity, isIosSafari } from './install-environment';
import {
  INSTALL_DISMISSED_STORAGE_KEY,
  INSTALLED_MESSAGE,
  InstallOutcome,
  InstallState,
} from './install.state';

const dispatchInstallPrompt = (outcome: InstallOutcome) => {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome }),
  });
  window.dispatchEvent(event);
  return event;
};

const stubDisplayMode = (standalone: boolean) => {
  const listeners: (() => void)[] = [];
  const query = {
    matches: standalone,
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    removeEventListener: () => undefined,
  };
  vi.stubGlobal('matchMedia', () => query);
  return (next: boolean) => {
    query.matches = next;
    listeners.forEach((listener) => listener());
  };
};

const browser = (userAgent: string, platform = 'iPhone', maxTouchPoints = 5): BrowserIdentity => ({
  userAgent,
  platform,
  maxTouchPoints,
});

describe('InstallState', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.removeItem(INSTALL_DISMISSED_STORAGE_KEY);
  });

  it('offers install once the browser allows it and remembers a dismissal', async () => {
    const state = TestBed.inject(InstallState);
    expect(state.canInstall()).toBe(false);

    const event = dispatchInstallPrompt('dismissed');
    expect(state.canInstall()).toBe(true);
    expect(event.defaultPrevented).toBe(true);

    await expect(state.install()).resolves.toBe('dismissed');
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(state.canInstall()).toBe(false);
    expect(Number(localStorage.getItem(INSTALL_DISMISSED_STORAGE_KEY))).toBeGreaterThan(0);
  });

  it('hides install and confirms once the app is installed', () => {
    const state = TestBed.inject(InstallState);
    dispatchInstallPrompt('accepted');

    window.dispatchEvent(new Event('appinstalled'));

    expect(state.canInstall()).toBe(false);
    expect(state.installed()).toBe(true);
    expect(TestBed.inject(ToastService).toasts()[0]?.message).toBe(INSTALLED_MESSAGE);
  });

  it('hides every install option while running standalone', () => {
    const setStandalone = stubDisplayMode(true);
    const state = TestBed.inject(InstallState);
    dispatchInstallPrompt('accepted');

    expect(state.installed()).toBe(true);
    expect(state.canInstall()).toBe(false);
    expect(state.canAddToHomeScreen()).toBe(false);

    setStandalone(false);
    expect(state.installed()).toBe(false);
  });

  it('recognises Safari on iPhone and iPad only', () => {
    const iphoneSafari =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Version/18.0 Mobile Safari/604.1';

    expect(isIosSafari(browser(iphoneSafari))).toBe(true);
    expect(isIosSafari(browser('Mozilla/5.0 (Macintosh) Safari/605.1', 'MacIntel', 5))).toBe(true);
    expect(isIosSafari(browser(`${iphoneSafari} CriOS/130.0`))).toBe(false);
    expect(isIosSafari(browser('Mozilla/5.0 (Macintosh) Safari/605.1', 'MacIntel', 0))).toBe(false);
  });
});
