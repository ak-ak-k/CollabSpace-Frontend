import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent, ButtonVariant } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `<button appButton [variant]="variant()" [busy]="busy()" block>Save</button>`,
})
class ButtonHostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly busy = signal(false);
}

describe('ButtonComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, button };
  };

  it('keeps the native button and its label', async () => {
    const { button } = await render();

    expect(button.textContent?.trim()).toBe('Save');
    expect(button.classList.contains('button--primary')).toBe(true);
    expect(button.classList.contains('button--block')).toBe(true);
  });

  it('shows a spinner and announces busy state', async () => {
    const { fixture, button } = await render();

    fixture.componentInstance.busy.set(true);
    await fixture.whenStable();

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('app-spinner')).not.toBeNull();
  });

  it('switches variant', async () => {
    const { fixture, button } = await render();

    fixture.componentInstance.variant.set('ghost');
    await fixture.whenStable();

    expect(button.classList.contains('button--ghost')).toBe(true);
    expect(button.classList.contains('button--primary')).toBe(false);
  });

  it('renders the inverted variant used for dark filled actions', async () => {
    const { fixture, button } = await render();

    fixture.componentInstance.variant.set('inverted');
    await fixture.whenStable();

    expect(button.classList.contains('button--inverted')).toBe(true);
  });
});
