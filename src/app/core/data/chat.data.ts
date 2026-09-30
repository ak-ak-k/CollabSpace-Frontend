import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import {
  MOCK_CONVERSATIONS,
  MOCK_REPLIES,
  MOCK_STARRED_CONVERSATION_IDS,
  MOCK_TYPING_USER_IDS,
  MOCK_UNREAD_COUNTS,
} from '../mocks/conversations.mock';
import { buildMockMessages } from '../mocks/messages.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import {
  ChannelConversation,
  Conversation,
  DirectConversation,
  GroupConversation,
} from '../models/conversation';
import { DeliveryState, Message, MessageDraft } from '../models/message';
import { planReply, scheduleReply } from './chat-simulation';
import { MockRequest } from './mock-request';

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

const EMPTY_SNAPSHOT: ChatSnapshot = {
  conversations: [],
  messages: {},
  unreadCounts: {},
  starredIds: [],
  mutedIds: [],
  typingUserIds: {},
};

const channelConversation = (channel: Channel): ChannelConversation => ({
  id: channel.id,
  type: 'channel',
  channelId: channel.id,
  teamId: channel.teamId,
  name: channel.name,
  memberIds: channel.memberIds,
});

@Service()
export class ChatData {
  private readonly request = inject(MockRequest);
  private readonly eventStream = new Subject<ChatEvent>();

  private conversations: Conversation[] = [
    ...MOCK_CONVERSATIONS,
    ...MOCK_CHANNELS.map(channelConversation),
  ];
  private messages: Record<string, Message[]> = buildMockMessages();
  private unreadCounts: Record<string, number> = { ...MOCK_UNREAD_COUNTS };
  private starredIds = new Set(MOCK_STARRED_CONVERSATION_IDS);
  private mutedIds = new Set<string>();
  private readonly users = new Map(MOCK_USERS.map((user) => [user.id, user]));
  private createdMessages = 0;
  private createdGroups = 0;
  private replyIndex = 0;

  readonly events$: Observable<ChatEvent> = this.eventStream.asObservable();

  getConversations(): Promise<ChatSnapshot> {
    return this.request.read(() => this.snapshot(), EMPTY_SNAPSHOT);
  }

  getMessages(conversationId: string): Promise<readonly Message[]> {
    return this.request.read(() => this.messages[conversationId] ?? [], []);
  }

  sendMessage(
    conversationId: string,
    draft: MessageDraft,
    deliveryState: DeliveryState,
  ): Promise<Message> {
    return this.request.write(() => {
      const message = this.buildMessage(conversationId, CURRENT_USER_ID, draft, deliveryState);
      this.append(message);
      this.unreadCounts[conversationId] = 0;
      if (deliveryState !== 'queued') {
        this.simulateReply(conversationId);
      }
      return message;
    });
  }

  saveMessage(message: Message): Promise<Message> {
    return this.request.write(() => {
      const thread = this.messages[message.conversationId] ?? [];
      const others = thread.filter((candidate) => candidate.id !== message.id);
      this.messages[message.conversationId] = [...others, message].sort(
        (first, second) => first.sentAt - second.sentAt,
      );
      return message;
    });
  }

  deleteMessage(conversationId: string, messageId: string): Promise<void> {
    return this.request.write(() => {
      const thread = this.messages[conversationId] ?? [];
      this.messages[conversationId] = thread.filter((message) => message.id !== messageId);
    });
  }

  setUnread(conversationId: string, count: number): Promise<void> {
    return this.request.write(() => {
      this.unreadCounts[conversationId] = count;
    });
  }

  setStarred(conversationId: string, starred: boolean): Promise<void> {
    return this.request.write(() => this.setMembership(this.starredIds, conversationId, starred));
  }

  setMuted(conversationId: string, muted: boolean): Promise<void> {
    return this.request.write(() => this.setMembership(this.mutedIds, conversationId, muted));
  }

  ensureDirectConversation(userId: string): Promise<DirectConversation> {
    return this.request.write(() => {
      const id = `dm-${userId}`;
      const existing = this.conversations.find((conversation) => conversation.id === id);
      if (existing?.type === 'dm') {
        return existing;
      }
      const created: DirectConversation = { id, type: 'dm', userId };
      this.conversations = [...this.conversations, created];
      this.messages[id] = [];
      return created;
    });
  }

  createGroup(name: string, memberIds: readonly string[]): Promise<GroupConversation> {
    return this.request.write(() => {
      const group: GroupConversation = {
        id: `g-new-${++this.createdGroups}`,
        type: 'group',
        name,
        memberIds: [CURRENT_USER_ID, ...memberIds],
      };
      this.conversations = [...this.conversations, group];
      this.messages[group.id] = [];
      return group;
    });
  }

  addChannel(channel: Channel): ChannelConversation {
    const conversation = channelConversation(channel);
    this.conversations = [...this.conversations, conversation];
    this.messages[channel.id] = [];
    return conversation;
  }

  private snapshot(): ChatSnapshot {
    return {
      conversations: this.conversations,
      messages: { ...this.messages },
      unreadCounts: { ...this.unreadCounts },
      starredIds: [...this.starredIds],
      mutedIds: [...this.mutedIds],
      typingUserIds: MOCK_TYPING_USER_IDS,
    };
  }

  private setMembership(ids: Set<string>, conversationId: string, member: boolean): void {
    if (member) {
      ids.add(conversationId);
    } else {
      ids.delete(conversationId);
    }
  }

  private append(message: Message): void {
    this.messages[message.conversationId] = [
      ...(this.messages[message.conversationId] ?? []),
      message,
    ];
  }

  private buildMessage(
    conversationId: string,
    authorId: string,
    draft: MessageDraft,
    deliveryState: DeliveryState,
  ): Message {
    return {
      id: `m-${Date.now().toString(36)}-${++this.createdMessages}`,
      conversationId,
      authorId,
      text: draft.text.trim(),
      sentAt: Date.now(),
      attachments: draft.attachments,
      reactions: [],
      replyToId: draft.replyToId,
      pinned: false,
      deliveryState,
    };
  }

  private simulateReply(conversationId: string): void {
    const conversation = this.conversations.find((candidate) => candidate.id === conversationId);
    if (!conversation) {
      return;
    }
    const plan = planReply(
      conversation,
      this.users,
      CURRENT_USER_ID,
      MOCK_REPLIES,
      this.replyIndex++,
    );
    scheduleReply(plan, {
      delivered: () => this.emit({ type: 'delivery', conversationId, state: 'delivered' }),
      typing: (userId) => this.emit({ type: 'typing', conversationId, userIds: [userId] }),
      read: () => this.emit({ type: 'delivery', conversationId, state: 'read' }),
      reply: (responderId, text) => this.deliverReply(conversationId, responderId, text),
    });
  }

  private deliverReply(conversationId: string, responderId: string, text: string): void {
    const message = this.buildMessage(
      conversationId,
      responderId,
      { text, attachments: [], replyToId: null },
      'sent',
    );
    this.append(message);
    this.emit({ type: 'typing', conversationId, userIds: [] });
    this.emit({ type: 'message', message });
  }

  private emit(event: ChatEvent): void {
    this.eventStream.next(event);
  }
}
