import { Signal, WritableSignal } from '@angular/core';
import { ChatEvent, ChatSnapshot, TypingEvent } from '../data/chat-events';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Conversation, NotifyLevel } from '../models/conversation';
import { Message, SavedEntry } from '../models/message';
import { threadKey } from '../models/thread';
import { advanceDelivery, appendMessage, Threads } from './chat-mutations';

export type Counts = Readonly<Record<string, number>>;

export interface ChatSignals {
  readonly conversations: WritableSignal<readonly Conversation[]>;
  readonly messages: WritableSignal<Threads>;
  readonly unreadCounts: WritableSignal<Counts>;
  readonly threadUnreadCounts: WritableSignal<Counts>;
  readonly starredIds: WritableSignal<ReadonlySet<string>>;
  readonly mutedIds: WritableSignal<ReadonlySet<string>>;
  readonly leftIds: WritableSignal<ReadonlySet<string>>;
  readonly archivedIds: WritableSignal<ReadonlySet<string>>;
  readonly notifyLevels: WritableSignal<Readonly<Record<string, NotifyLevel>>>;
  readonly saved: WritableSignal<Readonly<Record<string, SavedEntry>>>;
  readonly typingUserIds: WritableSignal<Readonly<Record<string, readonly string[]>>>;
  readonly activeConversationId: Signal<string | null>;
  readonly activeThreadId: Signal<string | null>;
}

const increment = (counts: Counts, key: string): Counts => ({
  ...counts,
  [key]: (counts[key] ?? 0) + 1,
});

export const applySnapshot = (chat: ChatSignals, snapshot: ChatSnapshot): void => {
  chat.conversations.set(snapshot.conversations);
  chat.messages.set(snapshot.messages);
  chat.unreadCounts.set(snapshot.unreadCounts);
  chat.threadUnreadCounts.set(snapshot.threadUnreadCounts);
  chat.starredIds.set(new Set(snapshot.starredIds));
  chat.mutedIds.set(new Set(snapshot.mutedIds));
  chat.leftIds.set(new Set(snapshot.leftIds));
  chat.archivedIds.set(new Set(snapshot.archivedIds));
  chat.notifyLevels.set(snapshot.notifyLevels);
  chat.saved.set(snapshot.saved);
  chat.typingUserIds.set(snapshot.typingUserIds);
};

const receive = (chat: ChatSignals, message: Message): void => {
  chat.messages.update((threads) => appendMessage(threads, message));
  const rootId = message.threadRootId;
  if (rootId) {
    if (rootId !== chat.activeThreadId() && message.authorId !== CURRENT_USER_ID) {
      chat.threadUnreadCounts.update((counts) => increment(counts, rootId));
    }
    return;
  }
  if (message.conversationId !== chat.activeConversationId()) {
    chat.unreadCounts.update((counts) => increment(counts, message.conversationId));
  }
};

export const typingKeyOf = (event: TypingEvent): string =>
  event.threadRootId ? threadKey(event.conversationId, event.threadRootId) : event.conversationId;

export const applyChatEvent = (chat: ChatSignals, event: ChatEvent): void => {
  if (event.type === 'typing') {
    chat.typingUserIds.update((typing) => ({ ...typing, [typingKeyOf(event)]: event.userIds }));
  } else if (event.type === 'delivery') {
    chat.messages.update((threads) =>
      advanceDelivery(threads, event.conversationId, CURRENT_USER_ID, event.state),
    );
  } else {
    receive(chat, event.message);
  }
};
