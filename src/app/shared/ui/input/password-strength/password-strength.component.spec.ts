import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthComponent } from './password-strength.component';

describe('PasswordStrengthComponent', () => {
  let fixture: ComponentFixture<PasswordStrengthComponent>;
  let host: HTMLElement;

  const summaryText = (): string =>
    host.querySelector('.strength__summary')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordStrengthComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('keeps the live region but shows nothing for an empty password', async () => {
    fixture.componentRef.setInput('password', '');
    await fixture.whenStable();

    expect(host.querySelector('.strength__summary')?.getAttribute('aria-live')).toBe('polite');
    expect(summaryText()).toBe('');
    expect(host.querySelectorAll('.strength__bar').length).toBe(0);
  });

  it('fills one bar per point and describes the missing criterion', async () => {
    fixture.componentRef.setInput('password', 'abcdefg1');
    await fixture.whenStable();

    expect(host.querySelectorAll('.strength__bar').length).toBe(4);
    expect(host.querySelectorAll('.strength__bar--filled').length).toBe(2);
    expect(summaryText()).toBe('Strength: Fair · mix upper and lower case');
    expect(host.classList.contains('password-strength--warning')).toBe(true);
  });

  it('hides the bars from assistive technology', async () => {
    fixture.componentRef.setInput('password', 'Abcdefg1!');
    await fixture.whenStable();

    expect(host.querySelector('.strength__bars')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.classList.contains('password-strength--success')).toBe(true);
  });
});
