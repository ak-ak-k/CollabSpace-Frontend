import { AttachmentView } from '../../../core/models/thread';
import { MessageCommand } from '../../../shared/components/message-bubble/message-menu';

export type MessageAction =
  | { readonly kind: MessageCommand; readonly messageId: string }
  | { readonly kind: 'react'; readonly messageId: string; readonly emoji: string }
  | { readonly kind: 'download'; readonly messageId: string; readonly name: string }
  | { readonly kind: 'view'; readonly messageId: string; readonly attachment: AttachmentView }
  | { readonly kind: 'reactors'; readonly messageId: string; readonly description: string }
  | { readonly kind: 'editSave'; readonly messageId: string; readonly text: string };
