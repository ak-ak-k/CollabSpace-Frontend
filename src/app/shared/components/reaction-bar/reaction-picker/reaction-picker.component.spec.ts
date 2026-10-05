import { TestBed } from '@angular/core/testing';
import { ReactionPickerComponent } from './reaction-picker.component';

describe('ReactionPickerComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(ReactionPickerComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const items = () => Array.from(host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    return { fixture, host, items };
  };

  it('renders a menu of quick reactions with spoken names and a More emoji toggle', async () => {
    const { host, items } = await render();

    expect(host.getAttribute('role')).toBe('menu');
    expect(items()[0].getAttribute('aria-label')).toBe('React with thumbs up');
    expect(items().at(-1)?.getAttribute('aria-label')).toBe('More emoji');
    expect(items()).toHaveLength(7);
  });

  it('expands to the full palette and collapses again', async () => {
    const { fixture, items } = await render();

    items().at(-1)?.click();
    await fixture.whenStable();

    expect(items()).toHaveLength(25);
    expect(items().at(-1)?.getAttribute('aria-label')).toBe('Fewer emoji');
    expect(items().at(-1)?.getAttribute('aria-expanded')).toBe('true');
  });

  it('moves focus with arrow keys, emits the pick and closes on Escape', async () => {
    const { fixture, host, items } = await render();
    const picked: string[] = [];
    let closed = false;
    fixture.componentInstance.picked.subscribe((emoji) => picked.push(emoji));
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    items()[0].focus();
    items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(items()[1]);

    items()[1].click();
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(picked).toEqual(['❤️']);
    expect(closed).toBe(true);
  });
});
