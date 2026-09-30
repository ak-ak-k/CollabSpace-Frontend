import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

export type EmptyStateKind = 'empty' | 'error' | 'offline';
export type EmptyStateHeadingLevel = 2 | 3 | 4;

interface EmptyStateDefaults {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
  readonly actionIcon: IconName;
  readonly role: 'status' | 'alert';
}

const DEFAULTS_BY_KIND: Record<EmptyStateKind, EmptyStateDefaults> = {
  empty: {
    icon: 'inbox',
    heading: 'Nothing here yet',
    message: 'When there’s something to show, it’ll appear here.',
    actionIcon: 'plus',
    role: 'status',
  },
  error: {
    icon: 'triangle-alert',
    heading: 'Something went wrong',
    message: 'We couldn’t load this right now. Check your connection and try again.',
    actionIcon: 'refresh-cw',
    role: 'alert',
  },
  offline: {
    icon: 'wifi-off',
    heading: 'Network unavailable',
    message: 'You’re offline. This will load as soon as you reconnect.',
    actionIcon: 'refresh-cw',
    role: 'status',
  },
};

@Component({
  selector: 'app-empty-state',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  host: {
    '[attr.role]': 'defaults().role',
    '[class.empty-state--error]': "kind() === 'error'",
    '[class.empty-state--compact]': 'compact()',
  },
})
export class EmptyStateComponent {
  readonly kind = input<EmptyStateKind>('empty');
  readonly icon = input<IconName>();
  readonly heading = input('');
  readonly message = input('');
  readonly actionLabel = input('');
  readonly actionIcon = input<IconName>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly headingLevel = input<EmptyStateHeadingLevel>(2);
  readonly action = output<void>();

  protected readonly defaults = computed(() => DEFAULTS_BY_KIND[this.kind()]);
  protected readonly shownIcon = computed(() => this.icon() ?? this.defaults().icon);
  protected readonly shownHeading = computed(() => this.heading() || this.defaults().heading);
  protected readonly shownMessage = computed(() => this.message() || this.defaults().message);
  protected readonly shownActionIcon = computed(
    () => this.actionIcon() ?? this.defaults().actionIcon,
  );
}
