import { FileType } from './file-item';

export type DeliveryState = 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type AttachmentKind = 'image' | 'file';

export interface Attachment {
  readonly kind: AttachmentKind;
  readonly type: FileType;
  readonly name: string;
  readonly size: string;
  readonly dimensions?: string;
  readonly bytes?: number;
  readonly src?: string;
}

export interface Reaction {
  readonly emoji: string;
  readonly userIds: readonly string[];
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly authorId: string;
  readonly text: string;
  readonly sentAt: number;
  readonly editedAt?: number;
  readonly attachments: readonly Attachment[];
  readonly reactions: readonly Reaction[];
  readonly replyToId: string | null;
  readonly threadRootId: string | null;
  readonly pinned: boolean;
  readonly pinnedBy?: string | null;
  readonly pinnedAt?: number | null;
  readonly deliveryState: DeliveryState;
  readonly syncFailed?: boolean;
}

export interface MessageDraft {
  readonly text: string;
  readonly attachments: readonly Attachment[];
  readonly replyToId: string | null;
  readonly threadRootId?: string | null;
}

export interface SavedEntry {
  readonly conversationId: string;
  readonly savedAt: number;
}

export interface SavedMessage {
  readonly message: Message;
  readonly savedAt: number;
}

export const DELIVERY_RANK: Record<DeliveryState, number> = {
  failed: 0,
  queued: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

export const isSettledDelivery = (state: DeliveryState): boolean =>
  DELIVERY_RANK[state] >= DELIVERY_RANK.sent;

export const isThreadReply = (message: Message): boolean => message.threadRootId !== null;
