import { booleanAttribute, Component, input } from '@angular/core';

export type CardElevation = 'none' | 'sm' | 'md' | 'lg';
export type CardPadding = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[class]': '"card--elevation-" + elevation() + " card--padding-" + padding()',
    '[class.card--interactive]': 'interactive()',
  },
})
export class CardComponent {
  readonly elevation = input<CardElevation>('none');
  readonly padding = input<CardPadding>('md');
  readonly interactive = input(false, { transform: booleanAttribute });
}
