import { inject, Service } from '@angular/core';
import { ChatData } from '../data/chat.data';
import { NotifyLevel } from '../models/conversation';
import { SavedEntry } from '../models/message';
import { setIn, withoutKey } from './chat-mutations';
import { conversationOfMessage } from './chat-selectors';
import { ChatState } from './chat.state';

@Service()
export class ChatFlagsState {
  private readonly chat = inject(ChatState);
  private readonly data = inject(ChatData);

  toggleFavourite(conversationId: string): boolean {
    const favourite = !this.chat.starredIds().has(conversationId);
    this.chat.starredIds.update((ids) => setIn(ids, conversationId, favourite));
    void this.data.setStarred(conversationId, favourite);
    return favourite;
  }

  toggleMute(conversationId: string): boolean {
    const muted = !this.chat.mutedIds().has(conversationId);
    this.setNotifyLevel(conversationId, muted ? 'muted' : 'all');
    return muted;
  }

  setNotifyLevel(conversationId: string, level: NotifyLevel): void {
    this.chat.notifyLevels.update((levels) => ({ ...levels, [conversationId]: level }));
    this.chat.mutedIds.update((ids) => setIn(ids, conversationId, level === 'muted'));
    void this.data.setNotifyLevel(conversationId, level);
  }

  toggleSave(messageId: string): boolean {
    if (this.chat.isSaved(messageId)) {
      this.chat.saved.update((saved) => withoutKey(saved, messageId));
      void this.data.setSaved(messageId, null);
      return false;
    }
    const conversationId = conversationOfMessage(this.chat.messages(), messageId);
    if (!conversationId) {
      return false;
    }
    const entry: SavedEntry = { conversationId, savedAt: Date.now() };
    this.chat.saved.update((saved) => ({ ...saved, [messageId]: entry }));
    void this.data.setSaved(messageId, entry);
    return true;
  }
}
