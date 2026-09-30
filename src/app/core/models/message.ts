import { FileType } from './file-item';

export type DeliveryState = 'queued' | 'sent' | 'delivered' | 'read';

export type AttachmentKind = 'image' | 'file';

export interface Attachment {
  readonly kind: AttachmentKind;
  readonly type: FileType;
  readonly name: string;
  readonly size: string;
  readonly dimensions?: string;
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
  readonly pinned: boolean;
  readonly deliveryState: DeliveryState;
}

export interface MessageDraft {
  readonly text: string;
  readonly attachments: readonly Attachment[];
  readonly replyToId: string | null;
}

export const DELIVERY_RANK: Record<DeliveryState, number> = {
  queued: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};
