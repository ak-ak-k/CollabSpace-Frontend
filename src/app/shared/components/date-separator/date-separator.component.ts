import { Component, computed, input } from '@angular/core';

export type DateSeparatorVariant = 'day' | 'new';

const NEW_MESSAGES_LABEL = 'New messages';

@Component({
  selector: 'app-date-separator',
  templateUrl: './date-separator.component.html',
  styleUrl: './date-separator.component.scss',
  host: {
    role: 'separator',
    '[attr.aria-label]': 'accessibleLabel()',
    '[class.date-separator--new]': 'isNew()',
  },
})
export class DateSeparatorComponent {
  readonly label = input('');
  readonly variant = input<DateSeparatorVariant>('day');

  protected readonly isNew = computed(() => this.variant() === 'new');
  protected readonly accessibleLabel = computed(() =>
    this.isNew() ? NEW_MESSAGES_LABEL : this.label(),
  );
}
