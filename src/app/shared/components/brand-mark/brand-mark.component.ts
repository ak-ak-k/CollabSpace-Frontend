import { Component, input } from '@angular/core';

export type BrandMarkSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-brand-mark',
  templateUrl: './brand-mark.component.html',
  styleUrl: './brand-mark.component.scss',
  host: {
    '[class]': '"brand-mark--" + size()',
    'aria-hidden': 'true',
  },
})
export class BrandMarkComponent {
  readonly size = input<BrandMarkSize>('md');
}
