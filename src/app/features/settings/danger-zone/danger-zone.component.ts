import { Component, input } from '@angular/core';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';

export type DangerZoneTone = 'danger' | 'neutral';

export type DangerZoneActionsAlign = 'center' | 'end';

@Component({
  selector: 'app-danger-zone',
  templateUrl: './danger-zone.component.html',
  styleUrl: './danger-zone.component.scss',
  host: {
    '[class.danger-zone--neutral]': "tone() === 'neutral'",
    '[class.danger-zone--actions-end]': "actionsAlign() === 'end'",
  },
})
export class DangerZoneComponent {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly tone = input<DangerZoneTone>('danger');
  readonly actionsAlign = input<DangerZoneActionsAlign>('center');

  protected readonly headingId = createUniqueId('danger-zone');
}
