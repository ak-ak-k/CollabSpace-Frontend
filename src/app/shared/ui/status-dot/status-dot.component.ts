import { booleanAttribute, Component, computed, input } from '@angular/core';
import { PRESENCE_LABELS, PresenceStatus } from '../../../core/models/user';

export type StatusDotSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-status-dot',
  templateUrl: './status-dot.component.html',
  styleUrl: './status-dot.component.scss',
  host: {
    '[class]': '"status-dot--" + status() + " status-dot--" + size()',
    '[attr.aria-hidden]': 'announce() ? null : "true"',
  },
})
export class StatusDotComponent {
  readonly status = input.required<PresenceStatus>();
  readonly size = input<StatusDotSize>('md');
  readonly announce = input(false, { transform: booleanAttribute });

  protected readonly label = computed(() => PRESENCE_LABELS[this.status()]);
}
