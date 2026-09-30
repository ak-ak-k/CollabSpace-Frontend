import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let fixture: ComponentFixture<ToggleComponent>;
  let host: HTMLElement;

  const control = (): HTMLButtonElement => host.querySelector('button') as HTMLButtonElement;
  const textOf = (id: string | null): string =>
    host.querySelector(`[id="${id}"]`)?.textContent?.trim() ?? '';

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Desktop notifications');
  });

  it('renders a switch named by its label and described by its description', async () => {
    fixture.componentRef.setInput('description', 'Show a banner for new messages.');
    await fixture.whenStable();

    expect(control().getAttribute('role')).toBe('switch');
    expect(control().type).toBe('button');
    expect(control().getAttribute('aria-checked')).toBe('false');
    expect(textOf(control().getAttribute('aria-labelledby'))).toBe('Desktop notifications');
    expect(textOf(control().getAttribute('aria-describedby'))).toBe(
      'Show a banner for new messages.',
    );
  });

  it('flips the checked state when the row is clicked', async () => {
    await fixture.whenStable();

    control().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.checked()).toBe(true);
    expect(control().getAttribute('aria-checked')).toBe('true');
    expect(host.querySelector('.toggle__track--on')).not.toBeNull();
  });

  it('keeps the label for assistive technology when it is hidden', async () => {
    fixture.componentRef.setInput('hideLabel', true);
    await fixture.whenStable();

    expect(host.querySelector('.toggle__text')?.classList.contains('visually-hidden')).toBe(true);
    expect(textOf(control().getAttribute('aria-labelledby'))).toBe('Desktop notifications');
  });

  it('does not flip while disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    control().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.checked()).toBe(false);
  });
});
