import { MessageView } from '../../../core/models/thread';
import { IconName } from '../../ui/icon/icon-registry';

export type MessageMenuKind =
  'thread' | 'save' | 'copy' | 'link' | 'quote' | 'pin' | 'unread' | 'edit' | 'delete';

export type MessageCommand =
  MessageMenuKind | 'retry' | 'discard' | 'actions' | 'jump' | 'editCancel';

export interface MessageMenuContext {
  readonly canPin: boolean;
  readonly inThread: boolean;
}

export interface MessageMenuItem {
  readonly kind: MessageMenuKind;
  readonly label: string;
  readonly icon: IconName;
  readonly destructive: boolean;
  readonly sheetOnly: boolean;
}

type ItemFlags = Partial<Pick<MessageMenuItem, 'destructive' | 'sheetOnly'>>;

const item = (
  kind: MessageMenuKind,
  label: string,
  icon: IconName,
  flags: ItemFlags = {},
): MessageMenuItem => ({ kind, label, icon, destructive: false, sheetOnly: false, ...flags });

export const saveLabelOf = (message: MessageView): string =>
  message.saved ? 'Remove from saved' : 'Save for later';

export const saveIconOf = (message: MessageView): IconName =>
  message.saved ? 'bookmark-x' : 'bookmark';

export const messageMenuItems = (
  message: MessageView,
  { canPin, inThread }: MessageMenuContext,
): MessageMenuItem[] => {
  const hasText = message.text !== '';
  const editable = message.mine && hasText && message.deliveryState !== 'failed';
  const candidates: readonly (MessageMenuItem | false)[] = [
    !inThread && item('thread', 'Reply in thread', 'messages-square', { sheetOnly: true }),
    item('save', saveLabelOf(message), saveIconOf(message), { sheetOnly: true }),
    hasText && item('copy', 'Copy text', 'copy'),
    item('link', 'Copy link', 'link'),
    !inThread && item('quote', 'Quote', 'quote'),
    canPin &&
      item('pin', message.pinned ? 'Unpin' : 'Pin message', message.pinned ? 'pin-off' : 'pin'),
    !inThread && !message.mine && item('unread', 'Mark unread from here', 'circle-dot'),
    editable && item('edit', 'Edit message', 'pencil'),
    message.mine && item('delete', 'Delete message', 'trash-2', { destructive: true }),
  ];
  return candidates.filter((candidate): candidate is MessageMenuItem => candidate !== false);
};

export const opensUpward = (trigger: HTMLElement): boolean => {
  const container = trigger.closest('[role="log"]');
  const bounds = container?.getBoundingClientRect() ?? {
    top: 0,
    bottom: trigger.ownerDocument.defaultView?.innerHeight ?? 0,
  };
  const offset = trigger.getBoundingClientRect().top - bounds.top;
  return offset > (bounds.bottom - bounds.top) / 2;
};
