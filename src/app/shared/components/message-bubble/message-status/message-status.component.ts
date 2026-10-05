import { booleanAttribute, Component, input, output } from '@angular/core';
import { IconComponent } from '../../../ui/icon/icon.component';
import { DeliveryStatus } from '../delivery-status';

const STATUS_ICON_SIZE = 14;

@Component({
  selector: 'app-message-status',
  imports: [IconComponent],
  templateUrl: './message-status.component.html',
  styleUrl: './message-status.component.scss',
})
export class MessageStatusComponent {
  readonly status = input<DeliveryStatus | null>(null);
  readonly failed = input(false, { transform: booleanAttribute });

  readonly retry = output<void>();
  readonly discard = output<void>();

  protected readonly iconSize = STATUS_ICON_SIZE;
}
