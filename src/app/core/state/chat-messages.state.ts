import { inject, Service } from '@angular/core';
import { ChatData } from '../data/chat.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Message } from '../models/message';
import { ComposerSubmission } from '../models/thread';
import {
  appendMessage,
  editMessage,
  insertMessage,
  reactToMessage,
  removeMessage,
  togglePinned,
} from './chat-mutations';
import { ChatState } from './chat.state';
import { NetworkState } from './network.state';

@Service()
export class ChatMessagesState {
  private readonly chat = inject(ChatState);
  private readonly data = inject(ChatData);
  private readonly network = inject(NetworkState);

  async send(conversationId: string, submission: ComposerSubmission): Promise<Message> {
    const deliveryState = this.network.online() ? 'sent' : 'queued';
    const message = await this.data.sendMessage(conversationId, submission, deliveryState);
    this.chat.messages.update((threads) => appendMessage(threads, message));
    this.chat.newMessagesMarkerId.set(null);
    return message;
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
    this.chat.messages.update((threads) => togglePinned(threads, conversationId, messageId));
    await this.persist(conversationId, messageId);
    return this.find(conversationId, messageId)?.pinned ?? false;
  }

  async react(conversationId: string, messageId: string, emoji: string): Promise<void> {
    this.chat.messages.update((threads) =>
      reactToMessage(threads, conversationId, messageId, emoji, CURRENT_USER_ID),
    );
    await this.persist(conversationId, messageId);
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
