import { Component, computed, input, numberAttribute } from '@angular/core';
import { PresenceStatus } from '../../../core/models/user';
import { initialsOf } from '../../pipes/initials.pipe';
import { StatusDotComponent, StatusDotSize } from '../status-dot/status-dot.component';

export type AvatarSize = 24 | 26 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 72 | 96 | 128;
export type AvatarVariant = 'tone' | 'inverted';

const TONE_COUNT = 6;
const TONE_STEP = 5;
const SMALL_DOT_MAX_SIZE = 36;
const LARGE_DOT_MIN_SIZE = 72;

@Component({
  selector: 'app-avatar',
  imports: [StatusDotComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  host: {
    '[class]': 'hostClass()',
    'aria-hidden': 'true',
  },
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly seed = input(0, { transform: numberAttribute });
  readonly size = input<AvatarSize>(40);
  readonly status = input<PresenceStatus | null>(null);
  readonly variant = input<AvatarVariant>('tone');
  readonly text = input<string>('');

  protected readonly initials = computed(() => this.text() || initialsOf(this.name()));
  protected readonly dotSize = computed<StatusDotSize>(() => this.dotSizeFor(this.size()));
  protected readonly hostClass = computed(
    () => `avatar--${this.size()} avatar--dot-${this.dotSize()} ${this.toneClass()}`,
  );

  private toneClass(): string {
    if (this.variant() === 'inverted') {
      return 'avatar--inverted';
    }
    return `avatar--tone-${((this.seed() * TONE_STEP + 1) % TONE_COUNT) + 1}`;
  }

  private dotSizeFor(size: AvatarSize): StatusDotSize {
    if (size >= LARGE_DOT_MIN_SIZE) {
      return 'lg';
    }
    return size <= SMALL_DOT_MAX_SIZE ? 'sm' : 'md';
  }
}
