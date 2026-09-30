import { TestBed } from '@angular/core/testing';
import { AUTH_STORAGE_KEY, AuthState } from './auth.state';

const MOCK_REQUEST_DURATION = 1000;

describe('AuthState', () => {
  beforeEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('remembers signing out', () => {
    const auth = TestBed.inject(AuthState);

    auth.logout();

    expect(auth.authenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('false');
  });

  it('signs in after the mock request and clears the expired flag', async () => {
    const auth = TestBed.inject(AuthState);
    auth.expireSession();
    expect(auth.sessionExpired()).toBe(true);

    const login = auth.login();
    await vi.advanceTimersByTimeAsync(MOCK_REQUEST_DURATION);
    await login;

    expect(auth.authenticated()).toBe(true);
    expect(auth.sessionExpired()).toBe(false);
  });
});
