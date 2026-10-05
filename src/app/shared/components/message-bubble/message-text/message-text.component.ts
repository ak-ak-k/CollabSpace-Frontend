import { booleanAttribute, Component, input } from '@angular/core';
import { TextSegment } from '../../../../core/models/thread';
import { IconComponent } from '../../../ui/icon/icon.component';
import { DeliveryStatus } from '../delivery-status';

const STATUS_ICON_SIZE = 14;

@Component({
  selector: 'app-message-text',
  imports: [IconComponent],
  templateUrl: './message-text.component.html',
  styleUrl: './message-text.component.scss',
})
export class MessageTextComponent {
  readonly segments = input.required<readonly TextSegment[]>();
  readonly edited = input(false, { transform: booleanAttribute });
  readonly status = input<DeliveryStatus | null>(null);

  protected readonly statusIconSize = STATUS_ICON_SIZE;
}
