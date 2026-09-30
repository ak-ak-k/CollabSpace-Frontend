import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  const render = async (count: number, label = '') => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('label', label);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('renders nothing for zero', async () => {
    const host = await render(0);

    expect(host.textContent?.trim()).toBe('');
    expect(host.classList.contains('badge--hidden')).toBe(true);
  });

  it('shows the count with a text alternative', async () => {
    const host = await render(3, '3 unread');

    expect(host.querySelector('[aria-hidden="true"]')?.textContent).toBe('3');
    expect(host.querySelector('.visually-hidden')?.textContent).toBe('3 unread');
  });

  it('caps large counts', async () => {
    const host = await render(250);

    expect(host.querySelector('[aria-hidden="true"]')?.textContent).toBe('99+');
  });
});
