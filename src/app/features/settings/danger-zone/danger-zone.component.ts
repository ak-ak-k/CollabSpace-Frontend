import { Component, input } from '@angular/core';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';

export type DangerZoneTone = 'danger' | 'neutral';

@Component({
  selector: 'app-danger-zone',
  templateUrl: './danger-zone.component.html',
  styleUrl: './danger-zone.component.scss',
  host: { '[class.danger-zone--neutral]': "tone() === 'neutral'" },
})
export class DangerZoneComponent {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly tone = input<DangerZoneTone>('danger');

  protected readonly headingId = createUniqueId('danger-zone');
}
