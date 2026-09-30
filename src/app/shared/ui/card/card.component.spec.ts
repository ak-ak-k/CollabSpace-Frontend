import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CardComponent, CardElevation } from './card.component';

@Component({
  imports: [CardComponent],
  template: `
    <app-card [elevation]="elevation()" padding="lg" interactive>
      <p cardKicker>Design</p>
      <h3 cardTitle>Brand refresh</h3>
      Landing page and product visuals.
      <p cardMeta>12 members</p>
    </app-card>
  `,
})
class CardHostComponent {
  readonly elevation = signal<CardElevation>('sm');
}

describe('CardComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(CardHostComponent);
    await fixture.whenStable();
    const card = (fixture.nativeElement as HTMLElement).querySelector('app-card') as HTMLElement;
    return { fixture, card };
  };

  it('projects the kicker, title, body and meta in order', async () => {
    const { card } = await render();

    const slots = Array.from(card.children).map((child) => child.textContent?.trim());

    expect(slots).toEqual([
      'Design',
      'Brand refresh',
      'Landing page and product visuals.',
      '12 members',
    ]);
  });

  it('reflects padding and interactivity', async () => {
    const { card } = await render();

    expect(card.classList.contains('card--padding-lg')).toBe(true);
    expect(card.classList.contains('card--interactive')).toBe(true);
  });

  it('switches elevation', async () => {
    const { fixture, card } = await render();

    fixture.componentInstance.elevation.set('lg');
    await fixture.whenStable();

    expect(card.classList.contains('card--elevation-lg')).toBe(true);
    expect(card.classList.contains('card--elevation-sm')).toBe(false);
  });
});
