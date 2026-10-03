import { TestBed } from '@angular/core/testing';
import { InstallOutcome, InstallState } from './install.state';

const dispatchInstallPrompt = (outcome: InstallOutcome) => {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome }),
  });
  window.dispatchEvent(event);
  return event;
};

describe('InstallState', () => {
  it('offers install once the browser allows it', () => {
    const state = TestBed.inject(InstallState);
    expect(state.canInstall()).toBe(false);

    const event = dispatchInstallPrompt('accepted');

    expect(state.canInstall()).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('shows the browser prompt and reports the choice', async () => {
    const state = TestBed.inject(InstallState);
    const event = dispatchInstallPrompt('dismissed');

    await expect(state.install()).resolves.toBe('dismissed');
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(state.canInstall()).toBe(false);
  });

  it('hides the option after the app is installed', () => {
    const state = TestBed.inject(InstallState);
    dispatchInstallPrompt('accepted');

    window.dispatchEvent(new Event('appinstalled'));

    expect(state.canInstall()).toBe(false);
  });
});
