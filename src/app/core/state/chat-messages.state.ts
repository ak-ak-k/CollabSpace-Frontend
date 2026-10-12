import { inject, InjectionToken, Service } from '@angular/core';
import { ChatData } from '../data/chat.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { DeliveryState, Message, MessageDraft } from '../models/message';
import {
  appendMessage,
  editMessage,
  failQueued,
  insertMessage,
  reactToMessage,
  releaseQueued,
  removeMessage,
  setDeliveryState,
  Threads,
  togglePinned,
  waitingMessagesOf,
} from './chat-mutations';
import { threadOf } from './chat-selectors';
import { ChatState } from './chat.state';
import { NetworkState } from './network.state';

export const SEND_ACKNOWLEDGE_DELAY = new InjectionToken<number>('SEND_ACKNOWLEDGE_DELAY', {
  factory: () => 650,
});

@Service()
export class ChatMessagesState {
  private readonly chat = inject(ChatState);
  private readonly data = inject(ChatData);
  private readonly network = inject(NetworkState);
  private readonly acknowledgeDelay = inject(SEND_ACKNOWLEDGE_DELAY);

  thread(conversationId: string, rootId: string): readonly Message[] {
    return threadOf(this.chat.messages()[conversationId] ?? [], rootId);
  }

  async send(conversationId: string, draft: MessageDraft): Promise<Message> {
    const online = this.network.online();
    const message = await this.data.sendMessage(
      conversationId,
      draft,
      online ? 'sending' : 'queued',
    );
    this.chat.messages.update((threads) => appendMessage(threads, message));
    if (!message.threadRootId) {
      this.chat.newMessagesMarkerId.set(null);
    }
    if (online) {
      this.acknowledgeLater(conversationId, message.id);
    }
    return message;
  }

  async retry(conversationId: string, messageId: string): Promise<boolean> {
    if (!this.network.online()) {
      return false;
    }
    this.setState(conversationId, messageId, 'sending');
    await this.data.setDeliveryState(conversationId, messageId, 'sending');
    this.acknowledgeLater(conversationId, messageId);
    return true;
  }

  async edit(conversationId: string, messageId: string, text: string): Promise<void> {
    this.chat.messages.update((threads) => editMessage(threads, conversationId, messageId, text));
    await this.persist(conversationId, messageId);
  }

  async remove(conversationId: string, messageId: string): Promise<Message | null> {
    const removed = this.find(conversationId, messageId);
    this.chat.messages.update((threads) => removeMessage(threads, conversationId, messageId));
    await this.data.deleteMessage(conversationId, messageId);
    return removed;
  }

  async restore(message: Message): Promise<void> {
    this.chat.messages.update((threads) => insertMessage(threads, message));
    await this.data.saveMessage(message);
  }

  async togglePin(conversationId: string, messageId: string): Promise<boolean> {
    this.chat.messages.update((threads) =>
      togglePinned(threads, conversationId, messageId, CURRENT_USER_ID),
    );
    await this.persist(conversationId, messageId);
    return this.find(conversationId, messageId)?.pinned ?? false;
  }

  async react(conversationId: string, messageId: string, emoji: string): Promise<void> {
    this.chat.messages.update((threads) =>
      reactToMessage(threads, conversationId, messageId, emoji, CURRENT_USER_ID),
    );
    await this.persist(conversationId, messageId);
  }

  flushQueue(): number {
    return this.settleQueue(releaseQueued);
  }

  failQueue(): number {
    return this.settleQueue(failQueued);
  }

  private settleQueue(settle: (threads: Threads) => Threads): number {
    const waiting = new Set(waitingMessagesOf(this.chat.messages()).map((message) => message.id));
    if (waiting.size === 0) {
      return 0;
    }
    const settled = settle(this.chat.messages());
    this.chat.messages.set(settled);
    Object.values(settled)
      .flatMap((thread) => thread.filter((message) => waiting.has(message.id)))
      .forEach((message) => void this.data.saveMessage(message));
    return waiting.size;
  }

  private acknowledgeLater(conversationId: string, messageId: string): void {
    setTimeout(() => void this.acknowledge(conversationId, messageId), this.acknowledgeDelay);
  }

  private async acknowledge(conversationId: string, messageId: string): Promise<void> {
    if (this.find(conversationId, messageId)?.deliveryState !== 'sending') {
      return;
    }
    const state: DeliveryState = this.network.online() ? 'sent' : 'failed';
    this.setState(conversationId, messageId, state);
    await this.data.setDeliveryState(conversationId, messageId, state);
  }

  private setState(conversationId: string, messageId: string, state: DeliveryState): void {
    this.chat.messages.update((threads) =>
      setDeliveryState(threads, conversationId, messageId, state),
    );
  }

  private find(conversationId: string, messageId: string): Message | null {
    const thread = this.chat.messages()[conversationId] ?? [];
    return thread.find((message) => message.id === messageId) ?? null;
  }

  private async persist(conversationId: string, messageId: string): Promise<void> {
    const message = this.find(conversationId, messageId);
    if (message) {
      await this.data.saveMessage(message);
    }
  }
}
