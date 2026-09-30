import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let fixture: ComponentFixture<InputComponent>;
  let host: HTMLElement;

  const control = (): HTMLInputElement => host.querySelector('input') as HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(InputComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Work email');
  });

  it('links the label to the input and writes typed text to the value', async () => {
    fixture.componentRef.setInput('optional', true);
    await fixture.whenStable();

    const label = host.querySelector('label');
    expect(label?.textContent).toContain('Work email');
    expect(label?.textContent).toContain('(optional)');
    expect(label?.getAttribute('for')).toBe(control().id);

    control().value = 'aarav@company.com';
    control().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('aarav@company.com');
  });

  it('describes the input only with the messages that are rendered', async () => {
    fixture.componentRef.setInput('hint', 'We never share it.');
    await fixture.whenStable();

    const hintId = host.querySelector('.field__hint')?.id;
    expect(control().getAttribute('aria-describedby')).toBe(hintId);
    expect(control().hasAttribute('aria-invalid')).toBe(false);

    fixture.componentRef.setInput('errorMessage', 'Enter your email address.');
    await fixture.whenStable();

    const errorId = host.querySelector('app-field-error')?.id;
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().getAttribute('aria-describedby')).toBe(`${hintId} ${errorId}`);
  });

  it('shows the form error only once the field is invalid and touched', async () => {
    fixture.componentRef.setInput('errors', [{ kind: 'required', message: 'Required.' }]);
    fixture.componentRef.setInput('invalid', true);
    await fixture.whenStable();

    expect(host.querySelector('app-field-error')).toBeNull();

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    expect(host.querySelector('app-field-error')?.textContent).toContain('Required.');
  });

  it('reveals and hides a password', async () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('revealable', true);
    await fixture.whenStable();

    const toggle = host.querySelector('button') as HTMLButtonElement;
    expect(control().type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    await fixture.whenStable();

    expect(control().type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });
});
