import { MOCK_CHANNELS } from '../mocks/channels.mock';
import {
  MOCK_CONVERSATIONS,
  MOCK_SAVED_MESSAGES,
  MOCK_STARRED_CONVERSATION_IDS,
  MOCK_THREAD_UNREAD_COUNTS,
  MOCK_TYPING_USER_IDS,
  MOCK_UNREAD_COUNTS,
} from '../mocks/conversations.mock';
import { buildMockMessages } from '../mocks/messages.mock';
import { Channel } from '../models/channel';
import {
  ChannelConversation,
  Conversation,
  MemberConversation,
  NotifyLevel,
} from '../models/conversation';
import { DeliveryState, Message, SavedEntry } from '../models/message';
import { ChatFlags, ChatSnapshot } from './chat-events';

export type ChatFlagKind = 'starred' | 'muted' | 'left' | 'archived';

export const channelConversation = (channel: Channel): ChannelConversation => ({
  id: channel.id,
  type: 'channel',
  channelId: channel.id,
  teamId: channel.teamId,
  name: channel.name,
  memberIds: channel.memberIds,
});

const byTime = (first: Message, second: Message): number => first.sentAt - second.sentAt;

export class ChatStore {
  private conversations: Conversation[] = [
    ...MOCK_CONVERSATIONS,
    ...MOCK_CHANNELS.map(channelConversation),
  ];
  private messages: Record<string, Message[]> = buildMockMessages();
  private unreadCounts: Record<string, number> = { ...MOCK_UNREAD_COUNTS };
  private threadUnreadCounts: Record<string, number> = { ...MOCK_THREAD_UNREAD_COUNTS };
  private notifyLevels: Record<string, NotifyLevel> = {};
  private saved: Record<string, SavedEntry> = { ...MOCK_SAVED_MESSAGES };
  private readonly flags: Record<ChatFlagKind, Set<string>> = {
    starred: new Set(MOCK_STARRED_CONVERSATION_IDS),
    muted: new Set(),
    left: new Set(),
    archived: new Set(),
  };

  snapshot(): ChatSnapshot {
    return {
      ...this.flagSnapshot(),
      conversations: this.conversations,
      messages: { ...this.messages },
      typingUserIds: MOCK_TYPING_USER_IDS,
    };
  }

  conversation(conversationId: string): Conversation | null {
    return this.conversations.find((candidate) => candidate.id === conversationId) ?? null;
  }

  thread(conversationId: string): readonly Message[] {
    return this.messages[conversationId] ?? [];
  }

  putConversation(conversation: Conversation): void {
    const exists = this.conversations.some((candidate) => candidate.id === conversation.id);
    this.conversations = exists
      ? this.conversations.map((candidate) =>
          candidate.id === conversation.id ? conversation : candidate,
        )
      : [...this.conversations, conversation];
    this.messages[conversation.id] ??= [];
  }

  setMembers(conversationId: string, memberIds: readonly string[]): MemberConversation | null {
    const conversation = this.conversation(conversationId);
    if (!conversation || conversation.type === 'dm') {
      return null;
    }
    const updated = { ...conversation, memberIds };
    this.putConversation(updated);
    return updated;
  }

  append(message: Message): void {
    this.messages[message.conversationId] = [...this.thread(message.conversationId), message];
  }

  putMessage(message: Message): void {
    const others = this.thread(message.conversationId).filter(
      (candidate) => candidate.id !== message.id,
    );
    this.messages[message.conversationId] = [...others, message].sort(byTime);
  }

  deleteMessage(conversationId: string, messageId: string): void {
    this.messages[conversationId] = this.thread(conversationId).filter(
      (message) => message.id !== messageId,
    );
  }

  setDelivery(conversationId: string, messageId: string, state: DeliveryState): Message | null {
    const message = this.thread(conversationId).find((candidate) => candidate.id === messageId);
    if (!message) {
      return null;
    }
    const updated = { ...message, deliveryState: state };
    this.putMessage(updated);
    return updated;
  }

  setUnread(conversationId: string, count: number): void {
    this.unreadCounts[conversationId] = count;
  }

  setThreadUnread(rootId: string, count: number): void {
    this.threadUnreadCounts[rootId] = count;
  }

  setFlag(kind: ChatFlagKind, conversationId: string, on: boolean): void {
    if (on) {
      this.flags[kind].add(conversationId);
    } else {
      this.flags[kind].delete(conversationId);
    }
  }

  setNotifyLevel(conversationId: string, level: NotifyLevel): void {
    this.notifyLevels[conversationId] = level;
    this.setFlag('muted', conversationId, level === 'muted');
  }

  setSaved(messageId: string, entry: SavedEntry | null): void {
    const next = { ...this.saved };
    delete next[messageId];
    this.saved = entry ? { ...next, [messageId]: entry } : next;
  }

  private flagSnapshot(): ChatFlags {
    return {
      unreadCounts: { ...this.unreadCounts },
      threadUnreadCounts: { ...this.threadUnreadCounts },
      starredIds: [...this.flags.starred],
      mutedIds: [...this.flags.muted],
      leftIds: [...this.flags.left],
      archivedIds: [...this.flags.archived],
      notifyLevels: { ...this.notifyLevels },
      saved: { ...this.saved },
    };
  }
}
