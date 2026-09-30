import { IconName } from '../../shared/ui/icon/icon-registry';
import { Attachment, AttachmentKind, DeliveryState } from './message';

export interface TextSegment {
  readonly text: string;
  readonly highlighted: boolean;
}

export interface AttachmentView {
  readonly kind: AttachmentKind;
  readonly name: string;
  readonly size: string;
  readonly dimensions: string;
  readonly icon: IconName;
  readonly label: string;
}

export interface ReactionView {
  readonly emoji: string;
  readonly count: number;
  readonly mine: boolean;
  readonly description: string;
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

export interface MentionCandidate {
  readonly id: string;
  readonly name: string;
  readonly firstName: string;
  readonly title: string;
  readonly seed: number;
}

export interface ComposerSubmission {
  readonly text: string;
  readonly attachments: readonly Attachment[];
  readonly replyToId: string | null;
}

export const DELIVERY_LABELS: Record<DeliveryState, string> = {
  queued: 'Queued — sends when you’re back online',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

export const DELIVERY_ICONS: Record<DeliveryState, IconName> = {
  queued: 'clock',
  sent: 'check',
  delivered: 'check-check',
  read: 'check-check',
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
