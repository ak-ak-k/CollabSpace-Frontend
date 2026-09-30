import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupFormExampleComponent } from './signup-form-example.component';

describe('SignupFormExampleComponent', () => {
  let fixture: ComponentFixture<SignupFormExampleComponent>;
  let host: HTMLElement;

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

  const submit = async (): Promise<void> => {
    host.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(SignupFormExampleComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('hides validation errors until the form is submitted', async () => {
    expect(errors()).toEqual([]);

    await submit();

    expect(errors()).toEqual([
      'Enter your email address.',
      'Enter your password.',
      'Please accept the terms to continue.',
    ]);
    expect(field('input[type="email"]').getAttribute('aria-invalid')).toBe('true');
  });

  it('re-validates while the fields are corrected', async () => {
    await submit();

    type('input[type="email"]', 'aarav');
    type('input[type="password"]', 'short');
    await fixture.whenStable();

    expect(errors()).toEqual([
      'That doesn’t look like an email address.',
      'Use at least 8 characters.',
      'Please accept the terms to continue.',
    ]);
  });

  it('submits once every field is valid', async () => {
    type('input[type="email"]', 'aarav@company.com');
    type('input[type="password"]', 'Abcdefg1!');
    field('input[type="checkbox"]').click();
    await fixture.whenStable();

    await submit();

    expect(errors()).toEqual([]);
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      'Account created for aarav@company.com.',
    );
  });
});
