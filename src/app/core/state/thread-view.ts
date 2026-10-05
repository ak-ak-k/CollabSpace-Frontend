import { emojiName } from '../models/emoji-names';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '../models/file-item';
import { Attachment, DeliveryState, Message, Reaction } from '../models/message';
import {
  AttachmentView,
  MessageView,
  ReactionView,
  ReplyPreview,
  ThreadRow,
  ThreadSummary,
} from '../models/thread';
import { firstNameOf, User, userColorSeed } from '../models/user';
import { formatDayLabel, formatTime, isSameDay } from '../../shared/pipes/time-format';
import { formatSegments, mentionsUser } from './chat-format';
import { threadOf, threadSummariesOf, timelineOf } from './chat-selectors';
import { replyCountLabel, threadPanelRows, threadPreviewOf } from './chat-thread-view';

export interface ThreadOptions {
  readonly currentUserId: string;
  readonly usersById: ReadonlyMap<string, User>;
  readonly searchTerm: string;
  readonly newMarkerId: string | null;
  readonly rootId: string | null;
  readonly savedIds: ReadonlySet<string>;
  readonly threadUnreadCounts: Readonly<Record<string, number>>;
  readonly fileIdFor?: (name: string) => string | null;
}

interface RowContext {
  readonly byId: ReadonlyMap<string, Message>;
  readonly summaries: ReadonlyMap<string, ThreadSummary>;
  readonly options: ThreadOptions;
}

const GROUPING_WINDOW = 5 * 60_000;

const DELIVERY_SPOKEN: Record<DeliveryState, string> = {
  queued: 'queued',
  sending: 'sending',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'not sent',
};

const attachmentView = (attachment: Attachment, options: ThreadOptions): AttachmentView => ({
  kind: attachment.kind,
  name: attachment.name,
  size: attachment.size,
  dimensions: attachment.dimensions ?? '',
  icon: FILE_TYPE_ICONS[attachment.type],
  label: FILE_TYPE_LABELS[attachment.type],
  src: attachment.src ?? '',
  fileId: options.fileIdFor?.(attachment.name) ?? null,
});

const nameOf = (userId: string, options: ThreadOptions): string =>
  userId === options.currentUserId
    ? 'You'
    : firstNameOf(options.usersById.get(userId)?.name ?? 'Someone');

const reactionView = (reaction: Reaction, options: ThreadOptions): ReactionView => ({
  emoji: reaction.emoji,
  count: reaction.userIds.length,
  mine: reaction.userIds.includes(options.currentUserId),
  description: `${reaction.userIds.map((userId) => nameOf(userId, options)).join(', ')} reacted with ${emojiName(reaction.emoji)}`,
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

const repliesLabel = (summary: ThreadSummary | null): string =>
  summary ? `, ${replyCountLabel(summary.replyCount)}` : '';

interface LabelFlags {
  readonly mine: boolean;
  readonly saved: boolean;
  readonly mentionsMe: boolean;
  readonly thread: ThreadSummary | null;
}

const accessibleLabel = (message: Message, authorName: string, flags: LabelFlags): string => {
  const pinned = message.pinned ? ', pinned' : '';
  const saved = flags.saved ? ', saved' : '';
  const mention = flags.mentionsMe ? ', mentions you' : '';
  const body = message.text || 'attachment';
  const delivery = flags.mine ? `, ${DELIVERY_SPOKEN[message.deliveryState]}` : '';
  const replies = repliesLabel(flags.thread);
  return `${authorName}, ${formatTime(message.sentAt)}${pinned}${saved}${mention}: ${body}${replies}${delivery}`;
};

const showsDeliveryLine = (message: Message, mine: boolean, isLastOwn: boolean): boolean =>
  mine &&
  (isLastOwn ||
    message.deliveryState === 'queued' ||
    message.deliveryState === 'sending' ||
    message.text === '');

const mentionsReader = (message: Message, options: ThreadOptions): boolean => {
  const reader = options.usersById.get(options.currentUserId);
  return (
    message.authorId !== options.currentUserId &&
    mentionsUser(message.text, firstNameOf(reader?.name ?? ''))
  );
};

const messageView = (
  message: Message,
  previous: Message | null,
  isLastOwn: boolean,
  { byId, summaries, options }: RowContext,
): MessageView => {
  const author = options.usersById.get(message.authorId);
  const authorName = author?.name ?? 'Someone';
  const mine = message.authorId === options.currentUserId;
  const saved = options.savedIds.has(message.id);
  const summary = summaries.get(message.id);
  const thread = summary ? threadPreviewOf(summary, options.usersById) : null;
  const mentionsMe = mentionsReader(message, options);
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
    segments: formatSegments(message.text),
    attachments: message.attachments.map((attachment) => attachmentView(attachment, options)),
    reactions: message.reactions.map((reaction) => reactionView(reaction, options)),
    replyTo: replyPreview(message, byId, options),
    isReply: message.threadRootId !== null,
    thread,
    saved,
    mentionsMe,
    pinned: message.pinned,
    edited: message.editedAt !== undefined,
    deliveryState: message.deliveryState,
    showsDeliveryLine: showsDeliveryLine(message, mine, isLastOwn),
    accessibleLabel: accessibleLabel(message, authorName, { mine, saved, mentionsMe, thread }),
  };
};

const matchesSearch = (message: Message, term: string): boolean =>
  term === '' || message.text.toLowerCase().includes(term);

const visibleMessages = (
  messages: readonly Message[],
  rootId: string | null,
): readonly Message[] => (rootId ? threadOf(messages, rootId) : timelineOf(messages));

const buildRows = (messages: readonly Message[], options: ThreadOptions): ThreadRow[] => {
  const term = options.searchTerm.trim().toLowerCase();
  const context: RowContext = {
    byId: new Map(messages.map((message) => [message.id, message])),
    summaries: options.rootId ? new Map() : threadSummariesOf(messages, options.threadUnreadCounts),
    options: { ...options, searchTerm: term },
  };
  const visible = visibleMessages(messages, options.rootId).filter((message) =>
    matchesSearch(message, term),
  );
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
      message: messageView(message, previous, message.id === lastOwnId, context),
    });
    previous = message;
  }
  return rows;
};

export const buildThread = (messages: readonly Message[], options: ThreadOptions): ThreadRow[] => {
  const rows = buildRows(messages, options);
  return options.rootId ? threadPanelRows(rows, options.rootId) : rows;
};
