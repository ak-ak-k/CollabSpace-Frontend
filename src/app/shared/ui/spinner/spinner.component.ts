import { Component, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md';
export type SpinnerTone = 'default' | 'on-primary';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  host: {
    'aria-hidden': 'true',
    '[class.spinner--md]': "size() === 'md'",
    '[class.spinner--on-primary]': "tone() === 'on-primary'",
  },
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('sm');
  readonly tone = input<SpinnerTone>('default');
}
