import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let host: HTMLElement;

  const auth = { requestPasswordReset: vi.fn(() => Promise.resolve()) };
  const toasts = { show: vi.fn() };

  const emailField = (): HTMLInputElement =>
    host.querySelector('input[type="email"]') as HTMLInputElement;
  const errors = (): string[] =>
    Array.from(host.querySelectorAll('app-field-error')).map(
      (error) => error.textContent?.trim() ?? '',
    );

  const typeEmail = (text: string): void => {
    emailField().value = text;
    emailField().dispatchEvent(new Event('input'));
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
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthState, useValue: auth },
        { provide: ToastService, useValue: toasts },
      ],
    });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders its title and the way back to log in', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Reset your password');
    expect(host.querySelector('a')?.textContent?.trim()).toBe('Back to log in');
  });

  it('shows validation errors after an invalid submit', async () => {
    typeEmail('aarav');
    await submit();

    expect(errors()).toEqual(['That doesn’t look like an email address.']);
    expect(document.activeElement).toBe(emailField());
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('requests the reset link and confirms where it was sent on a valid submit', async () => {
    typeEmail('aarav@northstar.io');
    await submit();

    expect(auth.requestPasswordReset).toHaveBeenCalledTimes(1);
    expect(host.querySelector('h1')?.textContent).toBe('Link sent');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('aarav@northstar.io');
    expect(document.activeElement).toBe(host.querySelector('h1'));
  });

  it('confirms when the link is sent again', async () => {
    typeEmail('aarav@northstar.io');
    await submit();

    host.querySelector<HTMLButtonElement>('button[type="button"]')?.click();

    expect(toasts.show).toHaveBeenCalledWith('We sent another link to aarav@northstar.io', {
      icon: 'mail',
    });
  });
});
