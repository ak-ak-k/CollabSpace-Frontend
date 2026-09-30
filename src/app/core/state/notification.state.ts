import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { NotificationsData } from '../data/notifications.data';
import { AppNotification, NotificationFilter } from '../models/notification';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

const matches = (notification: AppNotification, filter: NotificationFilter): boolean =>
  filter === 'all' || notification.category === filter;

@Service()
export class NotificationState {
  private readonly data = inject(NotificationsData);
  private readonly dataMode = inject(DataModeState);

  readonly notifications = signal<readonly AppNotification[]>([]);

  private readonly loader = new Loadable<readonly AppNotification[]>({
    fetch: () => this.data.getNotifications(),
    store: (notifications) => this.notifications.set(notifications),
    isEmpty: (notifications) => notifications.length === 0,
  });

  readonly status = this.loader.status;
  readonly unread = computed(() =>
    this.notifications().filter((notification) => !notification.read),
  );
  readonly unreadCount = computed(() => (this.status() === 'ready' ? this.unread().length : 0));
  readonly unreadMentionCount = computed(
    () => this.unread().filter((notification) => notification.category === 'mention').length,
  );

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  unreadCountFor(filter: NotificationFilter): number {
    return this.unread().filter((notification) => matches(notification, filter)).length;
  }

  async setRead(id: string, read: boolean): Promise<void> {
    this.notifications.update((notifications) =>
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read } : notification,
      ),
    );
    await this.data.markRead(id, read);
  }

  async markAllRead(filter: NotificationFilter): Promise<void> {
    this.notifications.update((notifications) =>
      notifications.map((notification) =>
        matches(notification, filter) ? { ...notification, read: true } : notification,
      ),
    );
    await this.data.markAllRead(filter);
  }

  async dismiss(id: string): Promise<AppNotification | null> {
    const dismissed = this.notifications().find((notification) => notification.id === id) ?? null;
    this.notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
    await this.data.dismiss(id);
    return dismissed;
  }

  async restore(notification: AppNotification): Promise<void> {
    this.notifications.update((notifications) =>
      [...notifications, notification].sort((first, second) => second.createdAt - first.createdAt),
    );
    await this.data.restore(notification);
  }
}
