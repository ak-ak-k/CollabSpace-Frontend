import { IconName } from '../../shared/ui/icon/icon-registry';
import { Attachment, AttachmentKind, DeliveryState } from './message';

export type TextStyle = 'plain' | 'mention' | 'bold' | 'italic' | 'code' | 'link';

export interface TextSegment {
  readonly text: string;
  readonly style: TextStyle;
  readonly href: string | null;
}

export interface AttachmentView {
  readonly kind: AttachmentKind;
  readonly name: string;
  readonly size: string;
  readonly dimensions: string;
  readonly icon: IconName;
  readonly label: string;
  readonly src: string;
  readonly fileId: string | null;
}

export interface ReactionView {
  readonly emoji: string;
  readonly count: number;
  readonly mine: boolean;
  readonly description: string;
}

export interface ThreadSummary {
  readonly replyCount: number;
  readonly lastReplyAt: number;
  readonly participantIds: readonly string[];
  readonly unreadCount: number;
}

export interface ThreadParticipant {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
}

export interface ThreadPreview extends ThreadSummary {
  readonly participants: readonly ThreadParticipant[];
}

export interface ReplyPreview {
  readonly authorFirstName: string;
  readonly text: string;
}

export interface MessageView {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorFirstName: string;
  readonly authorSeed: number;
  readonly mine: boolean;
  readonly continuation: boolean;
  readonly sentAt: number;
  readonly time: string;
  readonly text: string;
  readonly segments: readonly TextSegment[];
  readonly attachments: readonly AttachmentView[];
  readonly reactions: readonly ReactionView[];
  readonly replyTo: ReplyPreview | null;
  readonly isReply: boolean;
  readonly thread: ThreadPreview | null;
  readonly saved: boolean;
  readonly mentionsMe: boolean;
  readonly pinned: boolean;
  readonly edited: boolean;
  readonly deliveryState: DeliveryState;
  readonly showsDeliveryLine: boolean;
  readonly accessibleLabel: string;
}

export interface DayRow {
  readonly kind: 'day';
  readonly key: string;
  readonly label: string;
}

export interface NewMessagesRow {
  readonly kind: 'new';
  readonly key: string;
}

export interface MessageRow {
  readonly kind: 'message';
  readonly key: string;
  readonly message: MessageView;
}

export type ThreadRow = DayRow | NewMessagesRow | MessageRow;

export type MentionKind = 'member' | 'special' | 'outsider' | 'channel';

export type MentionTrigger = '@' | '#';

export interface MentionCandidate {
  readonly id: string;
  readonly kind: MentionKind;
  readonly token: string;
  readonly name: string;
  readonly firstName: string;
  readonly title: string;
  readonly seed: number;
}

export interface ComposerSubmission {
  readonly text: string;
  readonly attachments: readonly Attachment[];
  readonly replyToId: string | null;
  readonly threadRootId?: string | null;
}

export const threadKey = (conversationId: string, rootId: string): string =>
  `${conversationId}:${rootId}`;

export const DELIVERY_LABELS: Record<DeliveryState, string> = {
  queued: 'Queued — sends when you’re back online',
  sending: 'Sending…',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Not sent',
};

export const DELIVERY_ICONS: Record<DeliveryState, IconName> = {
  queued: 'clock',
  sending: 'circle-dashed',
  sent: 'check',
  delivered: 'check-check',
  read: 'check-check',
  failed: 'circle-alert',
};

export const QUICK_EMOJI: readonly string[] = ['👍', '❤️', '🎉', '👀', '🚀', '✅'];

export const EMOJI_PALETTE: readonly string[] = [
  '😀',
  '😂',
  '🙂',
  '😉',
  '😍',
  '🤔',
  '😅',
  '🙌',
  '👏',
  '🙏',
  '💪',
  '🔥',
  '✨',
  '💯',
  '👍',
  '👎',
  '❤️',
  '🎉',
  '👀',
  '🚀',
  '✅',
  '❌',
  '⚡',
  '☕',
];
