import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import {
  ChannelConversation,
  DirectConversation,
  GroupConversation,
  MemberConversation,
  NotifyLevel,
} from '../models/conversation';
import { DELIVERY_RANK, DeliveryState, Message, MessageDraft, SavedEntry } from '../models/message';
import { ChatEvent, ChatSnapshot, EMPTY_SNAPSHOT } from './chat-events';
import { ChatResponder } from './chat-responder';
import { channelConversation, ChatFlagKind, ChatStore } from './chat-store';
import { MockRequest } from './mock-request';

@Service()
export class ChatData {
  private readonly request = inject(MockRequest);
  private readonly eventStream = new Subject<ChatEvent>();
  private readonly store = new ChatStore();
  private readonly responder = new ChatResponder({
    store: this.store,
    emit: (event) => this.eventStream.next(event),
    createReply: (conversationId, authorId, draft) =>
      this.buildMessage(conversationId, authorId, draft, 'sent'),
  });
  private createdMessages = 0;
  private createdGroups = 0;

  readonly events$: Observable<ChatEvent> = this.eventStream.asObservable();

  getConversations(): Promise<ChatSnapshot> {
    return this.request.read(() => this.store.snapshot(), EMPTY_SNAPSHOT);
  }

  getMessages(conversationId: string): Promise<readonly Message[]> {
    return this.request.read(() => this.store.thread(conversationId), []);
  }

  sendMessage(
    conversationId: string,
    draft: MessageDraft,
    deliveryState: DeliveryState,
  ): Promise<Message> {
    return this.request.write(() => {
      const message = this.buildMessage(conversationId, CURRENT_USER_ID, draft, deliveryState);
      this.store.append(message);
      if (!message.threadRootId) {
        this.store.setUnread(conversationId, 0);
      }
      if (DELIVERY_RANK[deliveryState] > DELIVERY_RANK.queued) {
        this.responder.respondTo(message);
      }
      return message;
    });
  }

  saveMessage(message: Message): Promise<Message> {
    return this.request.write(() => {
      this.store.putMessage(message);
      return message;
    });
  }

  setDeliveryState(
    conversationId: string,
    messageId: string,
    state: DeliveryState,
  ): Promise<Message | null> {
    return this.request.write(() => this.store.setDelivery(conversationId, messageId, state));
  }

  deleteMessage(conversationId: string, messageId: string): Promise<void> {
    return this.request.write(() => this.store.deleteMessage(conversationId, messageId));
  }

  setUnread(conversationId: string, count: number): Promise<void> {
    return this.request.write(() => this.store.setUnread(conversationId, count));
  }

  setThreadUnread(rootId: string, count: number): Promise<void> {
    return this.request.write(() => this.store.setThreadUnread(rootId, count));
  }

  setStarred(conversationId: string, starred: boolean): Promise<void> {
    return this.setFlag('starred', conversationId, starred);
  }

  setLeft(conversationId: string, left: boolean): Promise<void> {
    return this.setFlag('left', conversationId, left);
  }

  setArchived(conversationId: string, archived: boolean): Promise<void> {
    return this.setFlag('archived', conversationId, archived);
  }

  setNotifyLevel(conversationId: string, level: NotifyLevel): Promise<void> {
    return this.request.write(() => this.store.setNotifyLevel(conversationId, level));
  }

  setSaved(messageId: string, entry: SavedEntry | null): Promise<void> {
    return this.request.write(() => this.store.setSaved(messageId, entry));
  }

  ensureDirectConversation(userId: string, workspaceId: string): Promise<DirectConversation> {
    return this.request.write(() => {
      const id = `dm-${userId}`;
      const scopedId = `${id}-${workspaceId}`;
      const existing = [this.store.conversation(id), this.store.conversation(scopedId)].find(
        (conversation): conversation is DirectConversation =>
          conversation?.type === 'dm' && conversation.workspaceId === workspaceId,
      );
      if (existing) {
        return existing;
      }
      const created: DirectConversation = {
        id: this.store.conversation(id) ? scopedId : id,
        type: 'dm',
        userId,
        workspaceId,
      };
      this.store.putConversation(created);
      return created;
    });
  }

  createGroup(
    name: string,
    memberIds: readonly string[],
    workspaceId: string,
  ): Promise<GroupConversation> {
    return this.request.write(() => {
      const group: GroupConversation = {
        id: `g-new-${++this.createdGroups}`,
        type: 'group',
        name,
        memberIds: [CURRENT_USER_ID, ...memberIds],
        workspaceId,
        createdBy: CURRENT_USER_ID,
      };
      this.store.putConversation(group);
      return group;
    });
  }

  renameGroup(conversationId: string, name: string): Promise<GroupConversation | null> {
    return this.request.write(() => {
      const group = this.store.conversation(conversationId);
      if (group?.type !== 'group') {
        return null;
      }
      const renamed = { ...group, name };
      this.store.putConversation(renamed);
      return renamed;
    });
  }

  setMembers(
    conversationId: string,
    memberIds: readonly string[],
  ): Promise<MemberConversation | null> {
    return this.request.write(() => this.store.setMembers(conversationId, memberIds));
  }

  addChannel(channel: Channel): ChannelConversation {
    const conversation = channelConversation(channel);
    this.store.putConversation(conversation);
    return conversation;
  }

  syncChannel(channel: Channel): ChannelConversation {
    return this.addChannel(channel);
  }

  private setFlag(kind: ChatFlagKind, conversationId: string, on: boolean): Promise<void> {
    return this.request.write(() => this.store.setFlag(kind, conversationId, on));
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
      threadRootId: draft.threadRootId ?? null,
      pinned: false,
      deliveryState,
    };
  }
}
