import { DELIVERY_ICONS, DELIVERY_LABELS, MessageView } from '../../../core/models/thread';
import { IconName } from '../../ui/icon/icon-registry';

export interface DeliveryStatus {
  readonly icon: IconName;
  readonly label: string;
  readonly accessibleLabel: string;
  readonly read: boolean;
}

const QUEUED_ACCESSIBLE_LABEL = 'Queued';

export const deliveryStatusOf = (message: MessageView): DeliveryStatus | null => {
  if (!message.mine) {
    return null;
  }
  const state = message.deliveryState;
  const label = DELIVERY_LABELS[state];
  return {
    icon: DELIVERY_ICONS[state],
    label,
    accessibleLabel: state === 'queued' ? QUEUED_ACCESSIBLE_LABEL : label,
    read: state === 'read',
  };
};
