import { Conversation, NotifyLevel } from '../models/conversation';
import { DeliveryState, Message, SavedEntry } from '../models/message';

export interface ChatFlags {
  readonly unreadCounts: Readonly<Record<string, number>>;
  readonly threadUnreadCounts: Readonly<Record<string, number>>;
  readonly starredIds: readonly string[];
  readonly mutedIds: readonly string[];
  readonly leftIds: readonly string[];
  readonly archivedIds: readonly string[];
  readonly notifyLevels: Readonly<Record<string, NotifyLevel>>;
  readonly saved: Readonly<Record<string, SavedEntry>>;
}

export interface ChatSnapshot extends ChatFlags {
  readonly conversations: readonly Conversation[];
  readonly messages: Readonly<Record<string, readonly Message[]>>;
  readonly typingUserIds: Readonly<Record<string, readonly string[]>>;
}

export interface TypingEvent {
  readonly type: 'typing';
  readonly conversationId: string;
  readonly threadRootId?: string | null;
  readonly userIds: readonly string[];
}

export interface MessageEvent {
  readonly type: 'message';
  readonly message: Message;
}

export interface DeliveryEvent {
  readonly type: 'delivery';
  readonly conversationId: string;
  readonly state: DeliveryState;
}

export type ChatEvent = TypingEvent | MessageEvent | DeliveryEvent;

export const EMPTY_FLAGS: ChatFlags = {
  unreadCounts: {},
  threadUnreadCounts: {},
  starredIds: [],
  mutedIds: [],
  leftIds: [],
  archivedIds: [],
  notifyLevels: {},
  saved: {},
};

export const EMPTY_SNAPSHOT: ChatSnapshot = {
  ...EMPTY_FLAGS,
  conversations: [],
  messages: {},
  typingUserIds: {},
};
