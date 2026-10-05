import {
  DeliveryState,
  DELIVERY_RANK,
  isSettledDelivery,
  Message,
  Reaction,
} from '../models/message';

export type Threads = Readonly<Record<string, readonly Message[]>>;

const replaceIn = (
  threads: Threads,
  conversationId: string,
  transform: (thread: readonly Message[]) => readonly Message[],
): Threads => ({ ...threads, [conversationId]: transform(threads[conversationId] ?? []) });

const updateMessage = (
  threads: Threads,
  conversationId: string,
  messageId: string,
  change: (message: Message) => Message,
): Threads =>
  replaceIn(threads, conversationId, (thread) =>
    thread.map((message) => (message.id === messageId ? change(message) : message)),
  );

export const appendMessage = (threads: Threads, message: Message): Threads =>
  replaceIn(threads, message.conversationId, (thread) => [...thread, message]);

export const insertMessage = (threads: Threads, message: Message): Threads =>
  replaceIn(threads, message.conversationId, (thread) =>
    [...thread.filter((candidate) => candidate.id !== message.id), message].sort(
      (first, second) => first.sentAt - second.sentAt,
    ),
  );

export const removeMessage = (
  threads: Threads,
  conversationId: string,
  messageId: string,
): Threads =>
  replaceIn(threads, conversationId, (thread) =>
    thread.filter((message) => message.id !== messageId),
  );

export const editMessage = (
  threads: Threads,
  conversationId: string,
  messageId: string,
  text: string,
): Threads =>
  updateMessage(threads, conversationId, messageId, (message) => ({
    ...message,
    text: text.trim(),
    editedAt: Date.now(),
  }));

export const togglePinned = (
  threads: Threads,
  conversationId: string,
  messageId: string,
  userId: string,
): Threads =>
  updateMessage(threads, conversationId, messageId, (message) => ({
    ...message,
    pinned: !message.pinned,
    pinnedBy: message.pinned ? null : userId,
    pinnedAt: message.pinned ? null : Date.now(),
  }));

export const setDeliveryState = (
  threads: Threads,
  conversationId: string,
  messageId: string,
  state: DeliveryState,
): Threads =>
  updateMessage(threads, conversationId, messageId, (message) => ({
    ...message,
    deliveryState: state,
  }));

const withoutEmpty = (reactions: readonly Reaction[]): Reaction[] =>
  reactions.filter((reaction) => reaction.userIds.length > 0);

export const toggleReaction = (
  reactions: readonly Reaction[],
  emoji: string,
  userId: string,
): Reaction[] => {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);
  if (!existing) {
    return [...reactions, { emoji, userIds: [userId] }];
  }
  const userIds = existing.userIds.includes(userId)
    ? existing.userIds.filter((id) => id !== userId)
    : [...existing.userIds, userId];
  return withoutEmpty(
    reactions.map((reaction) => (reaction.emoji === emoji ? { ...reaction, userIds } : reaction)),
  );
};

export const reactToMessage = (
  threads: Threads,
  conversationId: string,
  messageId: string,
  emoji: string,
  userId: string,
): Threads =>
  updateMessage(threads, conversationId, messageId, (message) => ({
    ...message,
    reactions: toggleReaction(message.reactions, emoji, userId),
  }));

export const advanceDelivery = (
  threads: Threads,
  conversationId: string,
  userId: string,
  state: DeliveryState,
): Threads =>
  replaceIn(threads, conversationId, (thread) =>
    thread.map((message) =>
      message.authorId === userId &&
      message.threadRootId === null &&
      isSettledDelivery(message.deliveryState) &&
      DELIVERY_RANK[message.deliveryState] < DELIVERY_RANK[state]
        ? { ...message, deliveryState: state }
        : message,
    ),
  );

export const releaseQueued = (threads: Threads): Threads =>
  Object.fromEntries(
    Object.entries(threads).map(([conversationId, thread]) => [
      conversationId,
      thread.map((message) =>
        message.deliveryState === 'queued'
          ? { ...message, deliveryState: 'sent' as const }
          : message,
      ),
    ]),
  );

export const firstUnreadId = (thread: readonly Message[], unreadCount: number): string | null =>
  unreadCount > 0 ? (thread[thread.length - unreadCount]?.id ?? null) : null;

export const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

export const setIn = (ids: ReadonlySet<string>, id: string, on: boolean): ReadonlySet<string> => {
  const next = new Set(ids);
  if (on) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
};

export const toggleIn = (ids: ReadonlySet<string>, id: string): ReadonlySet<string> =>
  setIn(ids, id, !ids.has(id));

export const withoutKey = <T>(
  record: Readonly<Record<string, T>>,
  key: string,
): Readonly<Record<string, T>> => {
  const next = { ...record };
  delete next[key];
  return next;
};
