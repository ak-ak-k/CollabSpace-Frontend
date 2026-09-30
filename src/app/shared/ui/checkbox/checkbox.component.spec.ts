import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

@Component({
  imports: [CheckboxComponent],
  template: `
    <app-checkbox [(checked)]="accepted" [errorMessage]="errorMessage()" [disabled]="disabled()">
      I agree to the <a href="/terms">Terms of Service</a>
    </app-checkbox>
  `,
})
class CheckboxHostComponent {
  readonly accepted = signal(false);
  readonly errorMessage = signal('');
  readonly disabled = signal(false);
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxHostComponent>;
  let host: HTMLElement;

  const control = (): HTMLInputElement => host.querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(CheckboxHostComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('wraps the native checkbox and the projected label in one label', () => {
    const label = host.querySelector('label');

    expect(label?.contains(control())).toBe(true);
    expect(label?.textContent).toContain('I agree to the Terms of Service');
    expect(label?.querySelector('a')?.getAttribute('href')).toBe('/terms');
    expect(host.querySelector('app-icon')).toBeNull();
  });

  it('updates the bound value when it is toggled', async () => {
    control().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.accepted()).toBe(true);
    expect(host.querySelector('.checkbox__box--checked app-icon')).not.toBeNull();
  });

  it('links the error message to the checkbox', async () => {
    fixture.componentInstance.errorMessage.set('Please accept the terms to continue.');
    await fixture.whenStable();

    const errorId = host.querySelector('app-field-error')?.id;
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().getAttribute('aria-describedby')).toBe(errorId);
    expect(host.querySelector('.checkbox__box--invalid')).not.toBeNull();
  });

  it('disables the native checkbox', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    expect(control().disabled).toBe(true);
  });
});
