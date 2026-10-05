import { MOCK_REPLIES } from '../mocks/conversations.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Message, MessageDraft } from '../models/message';
import { ChatEvent } from './chat-events';
import { planReply, planThreadReply, scheduleReply, threadResponders } from './chat-simulation';
import { ChatStore } from './chat-store';

export interface ChatResponderLinks {
  readonly store: ChatStore;
  readonly emit: (event: ChatEvent) => void;
  readonly createReply: (conversationId: string, authorId: string, draft: MessageDraft) => Message;
}

export class ChatResponder {
  private readonly users = new Map(MOCK_USERS.map((user) => [user.id, user]));
  private replyIndex = 0;

  constructor(private readonly links: ChatResponderLinks) {}

  respondTo(message: Message): void {
    if (message.threadRootId) {
      this.respondInThread(message.conversationId, message.threadRootId);
    } else {
      this.respondInConversation(message.conversationId);
    }
  }

  private respondInThread(conversationId: string, threadRootId: string): void {
    const responders = threadResponders(
      this.links.store.thread(conversationId),
      threadRootId,
      this.users,
      CURRENT_USER_ID,
    );
    const plan = planThreadReply(responders, MOCK_REPLIES, this.replyIndex++);
    const typing = (userIds: readonly string[]) =>
      this.links.emit({ type: 'typing', conversationId, threadRootId, userIds });
    scheduleReply(plan, {
      delivered: () => undefined,
      typing: (userId) => typing([userId]),
      read: () => undefined,
      reply: (responderId, text) => {
        typing([]);
        this.deliver(conversationId, responderId, text, threadRootId);
      },
    });
  }

  private respondInConversation(conversationId: string): void {
    const conversation = this.links.store.conversation(conversationId);
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
    const emit = this.links.emit;
    scheduleReply(plan, {
      delivered: () => emit({ type: 'delivery', conversationId, state: 'delivered' }),
      typing: (userId) => emit({ type: 'typing', conversationId, userIds: [userId] }),
      read: () => emit({ type: 'delivery', conversationId, state: 'read' }),
      reply: (responderId, text) => {
        emit({ type: 'typing', conversationId, userIds: [] });
        this.deliver(conversationId, responderId, text, null);
      },
    });
  }

  private deliver(
    conversationId: string,
    responderId: string,
    text: string,
    threadRootId: string | null,
  ): void {
    const message = this.links.createReply(conversationId, responderId, {
      text,
      attachments: [],
      replyToId: null,
      threadRootId,
    });
    this.links.store.append(message);
    this.links.emit({ type: 'message', message });
  }
}
