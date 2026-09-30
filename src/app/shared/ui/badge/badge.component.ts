import { Component, computed, input, numberAttribute } from '@angular/core';

export type BadgeSize = 'sm' | 'md';

const MAX_VISIBLE_COUNT = 99;

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  host: {
    '[class.badge--hidden]': '!visible()',
    '[class.badge--md]': "size() === 'md'",
  },
})
export class BadgeComponent {
  readonly count = input(0, { transform: numberAttribute });
  readonly size = input<BadgeSize>('md');
  readonly label = input('');

  protected readonly visible = computed(() => this.count() > 0);
  protected readonly text = computed(() =>
    this.count() > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : String(this.count()),
  );
}
