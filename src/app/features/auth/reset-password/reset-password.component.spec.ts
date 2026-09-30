import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let host: HTMLElement;

  const auth = { resetPassword: vi.fn(() => Promise.resolve()) };
  const toasts = { show: vi.fn() };

  const fieldLabelled = (label: string): HTMLInputElement => {
    const labels = Array.from(host.querySelectorAll('label'));
    const match = labels.find((candidate) => candidate.textContent?.trim() === label);
    return host.querySelector(`[id="${match?.htmlFor}"]`) as HTMLInputElement;
  };
  const errors = (): string[] =>
    Array.from(host.querySelectorAll('app-field-error')).map(
      (error) => error.textContent?.trim() ?? '',
    );

  const type = (label: string, text: string): void => {
    fieldLabelled(label).value = text;
    fieldLabelled(label).dispatchEvent(new Event('input'));
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
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(ResetPasswordComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders its title', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Choose a new password');
  });

  it('shows validation errors after an invalid submit', async () => {
    type('New password', 'short');
    type('Confirm new password', 'different');
    await submit();

    expect(errors()).toEqual(['Use at least 8 characters.', 'Passwords don’t match.']);
    expect(document.activeElement).toBe(fieldLabelled('New password'));
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password and returns to log in on a valid submit', async () => {
    type('New password', 'Abcdefg1!');
    type('Confirm new password', 'Abcdefg1!');
    await submit();

    expect(auth.resetPassword).toHaveBeenCalledTimes(1);
    expect(toasts.show).toHaveBeenCalledWith('Password reset — log in with your new password', {
      icon: 'key-round',
    });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
