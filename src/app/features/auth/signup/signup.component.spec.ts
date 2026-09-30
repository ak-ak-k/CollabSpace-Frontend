import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let host: HTMLElement;

  const auth = { signup: vi.fn(() => Promise.resolve()) };
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
    fixture = TestBed.createComponent(SignupComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders its title and the default workspace address', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Create your workspace');
    expect(host.textContent).toContain('Your address: your-team.collabspace.app');
  });

  it('shows validation errors after an invalid submit', async () => {
    await submit();

    expect(errors()).toEqual([
      'Enter your full name.',
      'Enter your email address.',
      'Enter your password.',
      'Passwords don’t match.',
      'Name your workspace — you can change it later.',
      'Please accept the terms to continue.',
    ]);
    expect(document.activeElement).toBe(fieldLabelled('Full name'));
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it('reports mismatched passwords on the confirm field', async () => {
    type('Password', 'Abcdefg1!');
    type('Confirm password', 'Abcdefg2!');
    await submit();

    const confirmField = fieldLabelled('Confirm password').closest('app-input');

    expect(confirmField?.querySelector('app-field-error')?.textContent?.trim()).toBe(
      'Passwords don’t match.',
    );
    expect(fieldLabelled('Password').getAttribute('aria-invalid')).toBeNull();
  });

  it('creates the workspace and opens the dashboard on a valid submit', async () => {
    type('Full name', 'Aarav Shah');
    type('Work email', 'aarav@northstar.io');
    type('Password', 'Abcdefg1!');
    type('Confirm password', 'Abcdefg1!');
    type('Workspace name', ' Northstar Labs ');
    host.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    await fixture.whenStable();

    expect(host.textContent).toContain('Your address: northstar-labs.collabspace.app');

    await submit();

    expect(auth.signup).toHaveBeenCalledTimes(1);
    expect(toasts.show).toHaveBeenCalledWith('Workspace “Northstar Labs” created', {
      icon: 'badge-check',
    });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
