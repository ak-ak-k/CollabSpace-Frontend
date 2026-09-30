import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconButtonComponent } from './icon-button.component';

@Component({
  imports: [IconButtonComponent],
  template: `<button appIconButton label="Close dialog" [pressed]="pressed()"></button>`,
})
class IconButtonHostComponent {
  readonly pressed = signal<boolean | undefined>(undefined);
}

describe('IconButtonComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(IconButtonHostComponent);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, button };
  };

  it('always has an accessible name', async () => {
    const { button } = await render();

    expect(button.getAttribute('aria-label')).toBe('Close dialog');
    expect(button.hasAttribute('aria-pressed')).toBe(false);
  });

  it('exposes the pressed state for toggles', async () => {
    const { fixture, button } = await render();

    fixture.componentInstance.pressed.set(true);
    await fixture.whenStable();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('icon-button--pressed')).toBe(true);
  });
});
