import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '../models/file-item';
import { Attachment, Message, Reaction } from '../models/message';
import {
  AttachmentView,
  MessageView,
  ReactionView,
  ReplyPreview,
  TextSegment,
  ThreadRow,
} from '../models/thread';
import { firstNameOf, User, userColorSeed } from '../models/user';
import { formatDayLabel, formatTime, isSameDay } from '../../shared/pipes/time-format';

export interface ThreadOptions {
  readonly currentUserId: string;
  readonly usersById: ReadonlyMap<string, User>;
  readonly searchTerm: string;
  readonly newMarkerId: string | null;
}

const GROUPING_WINDOW = 5 * 60_000;
const HIGHLIGHT_PATTERN = /(@[A-Z][a-z]+|#[a-z][a-z0-9-]*|NS-\d+)/g;

export const segmentsOf = (text: string): TextSegment[] =>
  text
    .split(HIGHLIGHT_PATTERN)
    .filter(Boolean)
    .map((part) => ({ text: part, highlighted: /^(@|#|NS-)/.test(part) }));

const attachmentView = (attachment: Attachment): AttachmentView => ({
  kind: attachment.kind,
  name: attachment.name,
  size: attachment.size,
  dimensions: attachment.dimensions ?? '',
  icon: FILE_TYPE_ICONS[attachment.type],
  label: FILE_TYPE_LABELS[attachment.type],
});

const nameOf = (userId: string, options: ThreadOptions): string =>
  userId === options.currentUserId
    ? 'You'
    : firstNameOf(options.usersById.get(userId)?.name ?? 'Someone');

const reactionView = (reaction: Reaction, options: ThreadOptions): ReactionView => ({
  emoji: reaction.emoji,
  count: reaction.userIds.length,
  mine: reaction.userIds.includes(options.currentUserId),
  description: `${reaction.userIds.map((userId) => nameOf(userId, options)).join(', ')} reacted with ${reaction.emoji}`,
});

const replyPreview = (
  message: Message,
  byId: ReadonlyMap<string, Message>,
  options: ThreadOptions,
): ReplyPreview | null => {
  const target = message.replyToId ? byId.get(message.replyToId) : undefined;
  if (!target) {
    return null;
  }
  const author = options.usersById.get(target.authorId);
  return {
    authorFirstName: firstNameOf(author?.name ?? 'Someone'),
    text: target.text || 'Attachment',
  };
};

const isContinuation = (message: Message, previous: Message | null, searching: boolean): boolean =>
  !searching &&
  previous !== null &&
  previous.authorId === message.authorId &&
  isSameDay(previous.sentAt, message.sentAt) &&
  message.sentAt - previous.sentAt < GROUPING_WINDOW &&
  message.replyToId === null;

const accessibleLabel = (message: Message, authorName: string, mine: boolean): string => {
  const pinned = message.pinned ? ', pinned' : '';
  const body = message.text || 'attachment';
  const delivery = mine ? `, ${message.deliveryState}` : '';
  return `${authorName}, ${formatTime(message.sentAt)}${pinned}: ${body}${delivery}`;
};

const messageView = (
  message: Message,
  previous: Message | null,
  isLastOwn: boolean,
  byId: ReadonlyMap<string, Message>,
  options: ThreadOptions,
): MessageView => {
  const author = options.usersById.get(message.authorId);
  const authorName = author?.name ?? 'Someone';
  const mine = message.authorId === options.currentUserId;
  return {
    id: message.id,
    authorId: message.authorId,
    authorName,
    authorFirstName: firstNameOf(authorName),
    authorSeed: userColorSeed(message.authorId),
    mine,
    continuation: isContinuation(message, previous, options.searchTerm !== ''),
    sentAt: message.sentAt,
    time: formatTime(message.sentAt),
    text: message.text,
    segments: segmentsOf(message.text),
    attachments: message.attachments.map(attachmentView),
    reactions: message.reactions.map((reaction) => reactionView(reaction, options)),
    replyTo: replyPreview(message, byId, options),
    pinned: message.pinned,
    edited: message.editedAt !== undefined,
    deliveryState: message.deliveryState,
    showsDeliveryLine:
      mine && (isLastOwn || message.deliveryState === 'queued' || message.text === ''),
    accessibleLabel: accessibleLabel(message, authorName, mine),
  };
};

const matchesSearch = (message: Message, term: string): boolean =>
  term === '' || message.text.toLowerCase().includes(term);

export const buildThread = (messages: readonly Message[], options: ThreadOptions): ThreadRow[] => {
  const term = options.searchTerm.trim().toLowerCase();
  const byId = new Map(messages.map((message) => [message.id, message]));
  const visible = messages.filter((message) => matchesSearch(message, term));
  const lastOwnId = [...visible]
    .reverse()
    .find((message) => message.authorId === options.currentUserId)?.id;
  const rows: ThreadRow[] = [];
  let previous: Message | null = null;
  for (const message of visible) {
    if (!previous || !isSameDay(previous.sentAt, message.sentAt)) {
      const dayKey = new Date(message.sentAt).toDateString();
      rows.push({ kind: 'day', key: `day-${dayKey}`, label: formatDayLabel(message.sentAt) });
      previous = null;
    }
    if (message.id === options.newMarkerId) {
      rows.push({ kind: 'new', key: 'new-messages' });
    }
    rows.push({
      kind: 'message',
      key: message.id,
      message: messageView(message, previous, message.id === lastOwnId, byId, {
        ...options,
        searchTerm: term,
      }),
    });
    previous = message;
  }
  return rows;
};
