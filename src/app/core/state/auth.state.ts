import { DOCUMENT, inject, Service, signal } from '@angular/core';

export const AUTH_STORAGE_KEY = 'collabspace.authenticated';
export const MINIMUM_PASSWORD_LENGTH = 8;

const SIGNED_OUT = 'false';
const SIGNED_IN = 'true';
const MOCK_REQUEST_DURATION = 1000;

@Service()
export class AuthState {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage;

  readonly authenticated = signal(this.readStoredSession());
  readonly sessionExpired = signal(false);

  async login(): Promise<void> {
    await this.mockRequest();
    this.startSession();
  }

  async signup(): Promise<void> {
    await this.mockRequest();
    this.startSession();
  }

  async requestPasswordReset(): Promise<void> {
    await this.mockRequest();
  }

  async resetPassword(): Promise<void> {
    await this.mockRequest();
  }

  logout(): void {
    this.authenticated.set(false);
    this.store(SIGNED_OUT);
  }

  expireSession(): void {
    this.logout();
    this.sessionExpired.set(true);
  }

  private startSession(): void {
    this.authenticated.set(true);
    this.sessionExpired.set(false);
    this.store(SIGNED_IN);
  }

  private mockRequest(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_REQUEST_DURATION));
  }

  private readStoredSession(): boolean {
    try {
      return this.storage?.getItem(AUTH_STORAGE_KEY) !== SIGNED_OUT;
    } catch {
      return true;
    }
  }

  private store(value: string): void {
    try {
      this.storage?.setItem(AUTH_STORAGE_KEY, value);
    } catch {
      return;
    }
  }
}
