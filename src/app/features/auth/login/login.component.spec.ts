import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MOCK_USERS } from '../../../core/mocks/users.mock';
import { User } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let host: HTMLElement;

  const auth = { sessionExpired: signal(false), login: vi.fn(() => Promise.resolve()) };
  const toasts = { show: vi.fn() };
  const workspace = { currentUser: signal<User | null>(MOCK_USERS[0]) };

  const field = (selector: string): HTMLInputElement =>
    host.querySelector(selector) as HTMLInputElement;
  const errors = (): string[] =>
    Array.from(host.querySelectorAll('app-field-error')).map(
      (error) => error.textContent?.trim() ?? '',
    );

  const type = (selector: string, text: string): void => {
    field(selector).value = text;
    field(selector).dispatchEvent(new Event('input'));
  };

  const settle = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  const submit = async (): Promise<void> => {
    host.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.sessionExpired.set(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthState, useValue: auth },
        { provide: ToastService, useValue: toasts },
        { provide: WorkspaceState, useValue: workspace },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders its title without the session alert', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Log in');
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows the session alert once the session has expired', async () => {
    auth.sessionExpired.set(true);
    await fixture.whenStable();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Your session expired for security.',
    );
  });

  it('shows validation errors and focuses the first invalid field after an invalid submit', async () => {
    await submit();

    expect(errors()).toEqual(['Enter your email address.', 'Enter your password.']);
    expect(document.activeElement).toBe(field('input[type="email"]'));
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in, welcomes the user and opens the dashboard on a valid submit', async () => {
    type('input[type="email"]', 'aarav@northstar.io');
    type('input[type="password"]', 'Abcdefg1!');
    await fixture.whenStable();

    await submit();

    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(toasts.show).toHaveBeenCalledWith('Welcome back, Aarav', { icon: 'circle-check' });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
