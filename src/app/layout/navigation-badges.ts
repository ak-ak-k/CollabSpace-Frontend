import { computed, inject, Service } from '@angular/core';
import { ChatState } from '../core/state/chat.state';
import { NotificationState } from '../core/state/notification.state';
import { NavigationBadge, NavigationItem } from './navigation';

@Service()
export class NavigationBadges {
  private readonly chat = inject(ChatState);
  private readonly notifications = inject(NotificationState);

  private readonly counts = computed<Record<NavigationBadge, number>>(() => ({
    messages: this.chat.status() === 'ready' ? this.chat.unreadDirectTotal() : 0,
    notifications: this.notifications.unreadCount(),
  }));

  countFor(item: NavigationItem): number {
    return item.badge ? this.counts()[item.badge] : 0;
  }

  labelFor(item: NavigationItem): string {
    const count = this.countFor(item);
    return count > 0 ? `${item.accessibleLabel}, ${count} unread` : item.accessibleLabel;
  }
}
