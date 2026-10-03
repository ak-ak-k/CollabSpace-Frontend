import { Conversation } from '../models/conversation';
import { DeliveryState, Message } from '../models/message';

export interface ChatSnapshot {
  readonly conversations: readonly Conversation[];
  readonly messages: Readonly<Record<string, readonly Message[]>>;
  readonly unreadCounts: Readonly<Record<string, number>>;
  readonly starredIds: readonly string[];
  readonly mutedIds: readonly string[];
  readonly typingUserIds: Readonly<Record<string, readonly string[]>>;
}

export interface TypingEvent {
  readonly type: 'typing';
  readonly conversationId: string;
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

export const EMPTY_SNAPSHOT: ChatSnapshot = {
  conversations: [],
  messages: {},
  unreadCounts: {},
  starredIds: [],
  mutedIds: [],
  typingUserIds: {},
};
