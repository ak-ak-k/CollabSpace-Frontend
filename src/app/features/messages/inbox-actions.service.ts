import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { NotifyLevel } from '../../core/models/conversation';
import { ToastService } from '../../core/services/toast.service';
import { ChatFlagsState } from '../../core/state/chat-flags.state';
import { ChatState } from '../../core/state/chat.state';
import { IconName } from '../../shared/ui/icon/icon-registry';

const SAVED_ROUTE = '/messages/saved';

const NOTIFY_TOASTS: Record<NotifyLevel, { readonly message: string; readonly icon: IconName }> = {
  all: { message: 'You’ll be notified about every message', icon: 'bell' },
  mentions: { message: 'You’ll only be notified about mentions', icon: 'bell' },
  muted: { message: 'Muted — no notifications', icon: 'bell-off' },
};

@Service()
export class InboxActions {
  private readonly chat = inject(ChatState);
  private readonly flags = inject(ChatFlagsState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  toggleFavourite(conversationId: string): void {
    const favourite = this.flags.toggleFavourite(conversationId);
    this.toasts.show(favourite ? 'Added to favourites' : 'Removed from favourites', {
      icon: 'star',
    });
  }

  toggleMute(conversationId: string): void {
    const muted = this.flags.toggleMute(conversationId);
    this.toasts.show(muted ? 'Conversation muted' : 'Conversation unmuted', {
      icon: muted ? 'bell-off' : 'bell',
    });
  }

  setNotifyLevel(conversationId: string, level: NotifyLevel): void {
    this.flags.setNotifyLevel(conversationId, level);
    const toast = NOTIFY_TOASTS[level];
    this.toasts.show(toast.message, { icon: toast.icon });
  }

  markRead(conversationId: string): void {
    this.chat.markRead(conversationId);
  }

  markUnread(conversationId: string): void {
    this.chat.markUnread(conversationId);
    this.toasts.show('Marked as unread', { icon: 'circle-dot' });
  }

  toggleSave(messageId: string): void {
    const saved = this.flags.toggleSave(messageId);
    if (saved) {
      this.toasts.show('Saved for later', {
        icon: 'bookmark',
        actionLabel: 'View saved',
        onAction: () => void this.router.navigateByUrl(SAVED_ROUTE),
      });
      return;
    }
    this.toasts.show('Removed from saved', {
      icon: 'bookmark',
      actionLabel: 'Undo',
      onAction: () => void this.flags.toggleSave(messageId),
    });
  }
}
