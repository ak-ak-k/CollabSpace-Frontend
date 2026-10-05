import { Conversation } from '../models/conversation';
import { Message, SavedEntry, SavedMessage } from '../models/message';
import { ThreadSummary } from '../models/thread';
import { Threads } from './chat-mutations';

export interface ListingContext {
  readonly currentUserId: string;
  readonly leftIds: ReadonlySet<string>;
  readonly archivedIds: ReadonlySet<string>;
  readonly joinedTeamIds: ReadonlySet<string>;
  readonly privateChannelIds: ReadonlySet<string>;
}

const PARTICIPANT_LIMIT = 3;

export const timelineOf = (messages: readonly Message[]): readonly Message[] =>
  messages.filter((message) => message.threadRootId === null);

export const timelinesOf = (threads: Threads): Threads =>
  Object.fromEntries(
    Object.entries(threads).map(([conversationId, messages]) => [
      conversationId,
      timelineOf(messages),
    ]),
  );

export const threadOf = (messages: readonly Message[], rootId: string): readonly Message[] =>
  messages.filter((message) => message.id === rootId || message.threadRootId === rootId);

export const isListed = (conversation: Conversation, context: ListingContext): boolean => {
  if (context.leftIds.has(conversation.id)) {
    return false;
  }
  if (conversation.type !== 'channel') {
    return true;
  }
  const visibleToMe =
    !context.privateChannelIds.has(conversation.id) ||
    conversation.memberIds.includes(context.currentUserId);
  return (
    context.joinedTeamIds.has(conversation.teamId) &&
    !context.archivedIds.has(conversation.id) &&
    visibleToMe
  );
};

export const savedMessagesOf = (
  saved: Readonly<Record<string, SavedEntry>>,
  threads: Threads,
  inScope: (conversationId: string) => boolean,
): readonly SavedMessage[] =>
  Object.entries(saved)
    .flatMap(([messageId, entry]) => {
      const message = threads[entry.conversationId]?.find(
        (candidate) => candidate.id === messageId,
      );
      return message && inScope(entry.conversationId) ? [{ message, savedAt: entry.savedAt }] : [];
    })
    .sort((first, second) => second.savedAt - first.savedAt);

export const conversationOfMessage = (threads: Threads, messageId: string): string | null =>
  Object.entries(threads).find(([, messages]) =>
    messages.some((message) => message.id === messageId),
  )?.[0] ?? null;

export const unreadFromHere = (
  timeline: readonly Message[],
  messageId: string,
  currentUserId: string,
): number | null => {
  const index = timeline.findIndex((message) => message.id === messageId);
  if (index < 0) {
    return null;
  }
  const fromOthers = timeline.slice(index).filter((message) => message.authorId !== currentUserId);
  return Math.max(1, fromOthers.length);
};

const repliesByRoot = (messages: readonly Message[]): Map<string, Message[]> => {
  const replies = new Map<string, Message[]>();
  for (const message of messages) {
    if (message.threadRootId) {
      replies.set(message.threadRootId, [...(replies.get(message.threadRootId) ?? []), message]);
    }
  }
  return replies;
};

export const threadSummariesOf = (
  messages: readonly Message[],
  threadUnreadCounts: Readonly<Record<string, number>>,
): ReadonlyMap<string, ThreadSummary> =>
  new Map(
    [...repliesByRoot(messages)].map(([rootId, replies]) => [
      rootId,
      {
        replyCount: replies.length,
        lastReplyAt: replies[replies.length - 1].sentAt,
        participantIds: [...new Set(replies.map((reply) => reply.authorId))].slice(
          -PARTICIPANT_LIMIT,
        ),
        unreadCount: threadUnreadCounts[rootId] ?? 0,
      },
    ]),
  );
