import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { conversationRoute } from '../../../core/models/conversation';
import { ChatMessagesState } from '../../../core/state/chat-messages.state';
import { ChatState } from '../../../core/state/chat.state';
import { ConversationView } from './conversation-view';

@Injectable()
export class ConversationActions {
  private readonly chat = inject(ChatState);
  private readonly messages = inject(ChatMessagesState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  toggleStar(conversationId: string): void {
    const starred = this.chat.toggleStar(conversationId);
    this.toasts.show(starred ? 'Added to starred' : 'Removed from starred', { icon: 'star' });
  }

  toggleMute(conversationId: string): void {
    const muted = this.chat.toggleMute(conversationId);
    this.toasts.show(muted ? 'Conversation muted' : 'Conversation unmuted', {
      icon: muted ? 'bell-off' : 'bell',
    });
  }

  markUnread(conversationId: string): void {
    this.chat.markUnread(conversationId);
    this.toasts.show('Marked as unread', { icon: 'circle-dot' });
  }

  async copyLink(conversationId: string): Promise<void> {
    const conversation = this.chat.conversation(conversationId);
    if (!conversation) {
      return;
    }
    const path = conversationRoute(conversation);
    await this.writeClipboard(`${this.document.location.origin}${path}`, 'Link copied', 'link');
  }

  async copyText(text: string): Promise<void> {
    await this.writeClipboard(text, 'Copied to clipboard', 'copy');
  }

  async leave(view: ConversationView, backLink: string): Promise<void> {
    const kind = view.type === 'channel' ? 'channel' : 'group';
    const confirmed = await this.dialogs.confirm({
      title: `Leave ${view.title}?`,
      body: `You’ll stop getting messages from this ${kind}. You can rejoin any time.`,
      confirmLabel: 'Leave',
      icon: 'log-out',
    });
    if (confirmed) {
      this.toasts.show(`You left ${view.title}`, { icon: 'log-out' });
      await this.router.navigateByUrl(backLink);
    }
  }

  async togglePin(conversationId: string, messageId: string): Promise<void> {
    const pinned = await this.messages.togglePin(conversationId, messageId);
    this.toasts.show(pinned ? 'Message pinned' : 'Message unpinned', {
      icon: pinned ? 'pin' : 'pin-off',
    });
  }

  async remove(conversationId: string, messageId: string): Promise<boolean> {
    const confirmed = await this.dialogs.confirm({
      title: 'Delete message?',
      body: 'This removes the message for everyone in the conversation. You can undo right after.',
      confirmLabel: 'Delete',
      icon: 'trash-2',
    });
    if (!confirmed) {
      return false;
    }
    const removed = await this.messages.remove(conversationId, messageId);
    if (removed) {
      this.toasts.show('Message deleted', {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => void this.messages.restore(removed),
      });
    }
    return true;
  }

  async saveEdit(conversationId: string, messageId: string, text: string): Promise<void> {
    await this.messages.edit(conversationId, messageId, text);
    this.toasts.show('Message edited', { icon: 'pencil' });
  }

  react(conversationId: string, messageId: string, emoji: string): void {
    void this.messages.react(conversationId, messageId, emoji);
  }

  download(name: string): void {
    this.toasts.show(`Downloading ${name}`, { icon: 'download' });
  }

  private async writeClipboard(
    text: string,
    success: string,
    icon: 'copy' | 'link',
  ): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(text);
      this.toasts.show(success, { icon });
    } catch {
      this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
        icon: 'circle-alert',
      });
    }
  }
}
