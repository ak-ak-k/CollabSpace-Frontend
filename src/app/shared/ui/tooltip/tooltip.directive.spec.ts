import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TOOLTIP_SHOW_DELAY_MS } from './tooltip-position';
import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: `
    <button type="button" class="described" appTooltip="Copy link to task">Copy</button>
    <button type="button" class="labelled" aria-label="Close" appTooltip="Close">x</button>
  `,
})
class TooltipHostComponent {}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TooltipHostComponent>;

  const target = (name: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(`.${name}`) as HTMLButtonElement;
  const bubble = () => document.querySelector<HTMLElement>('app-tooltip-bubble');
  const hover = (name: string) => target(name).dispatchEvent(new Event('pointerenter'));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TooltipHostComponent);
    await fixture.whenStable();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the bubble after the delay and hides it on leave', () => {
    hover('described');

    vi.advanceTimersByTime(TOOLTIP_SHOW_DELAY_MS - 1);
    expect(bubble()).toBeNull();

    vi.advanceTimersByTime(1);
    expect(bubble()?.textContent?.trim()).toBe('Copy link to task');

    target('described').dispatchEvent(new Event('pointerleave'));
    expect(bubble()).toBeNull();
  });

  it('hides on Escape and on scroll', () => {
    hover('described');
    vi.advanceTimersByTime(TOOLTIP_SHOW_DELAY_MS);
    target('described').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(bubble()).toBeNull();

    hover('described');
    vi.advanceTimersByTime(TOOLTIP_SHOW_DELAY_MS);
    document.dispatchEvent(new Event('scroll'));
    expect(bubble()).toBeNull();
  });

  it('stays hidden for touch input', () => {
    const touch = new Event('pointerenter');
    Object.defineProperty(touch, 'pointerType', { value: 'touch' });

    target('described').dispatchEvent(touch);
    vi.advanceTimersByTime(TOOLTIP_SHOW_DELAY_MS);

    expect(bubble()).toBeNull();
  });

  it('describes the host unless its label already says the same', () => {
    const descriptionId = target('described').getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(descriptionId)?.textContent).toBe('Copy link to task');
    expect(target('labelled').hasAttribute('aria-describedby')).toBe(false);
  });
});
