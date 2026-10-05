import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { NotificationsData } from '../data/notifications.data';
import { AppNotification, NotificationFilter } from '../models/notification';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

const matches = (notification: AppNotification, filter: NotificationFilter): boolean =>
  filter === 'all' || notification.category === filter;

const newestFirst = (notifications: AppNotification[]): AppNotification[] =>
  notifications.sort((first, second) => second.createdAt - first.createdAt);

@Service()
export class NotificationState {
  private readonly data = inject(NotificationsData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allNotifications = signal<readonly AppNotification[]>([]);

  private readonly loader = new Loadable<readonly AppNotification[]>({
    fetch: () => this.data.getNotifications(),
    store: (notifications) => this.allNotifications.set(notifications),
    isEmpty: (notifications) => notifications.length === 0,
  });

  readonly notifications = computed(() =>
    this.allNotifications().filter((notification) => this.workspace.contains(notification)),
  );
  readonly loadStatus = this.loader.status.asReadonly();
  readonly status = settledStatus(this.loader.status, () => this.notifications().length === 0);
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
    this.allNotifications.update((notifications) =>
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read } : notification,
      ),
    );
    await this.data.markRead(id, read);
  }

  async markAllRead(filter: NotificationFilter): Promise<void> {
    this.allNotifications.update((notifications) =>
      notifications.map((notification) =>
        this.workspace.contains(notification) && matches(notification, filter)
          ? { ...notification, read: true }
          : notification,
      ),
    );
    await this.data.markAllRead(filter, this.workspace.currentWorkspaceId());
  }

  async dismiss(id: string): Promise<AppNotification | null> {
    const dismissed = this.notifications().find((notification) => notification.id === id) ?? null;
    this.allNotifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
    await this.data.dismiss(id);
    return dismissed;
  }

  async add(added: readonly AppNotification[]): Promise<void> {
    if (added.length === 0) {
      return;
    }
    this.allNotifications.update((notifications) => newestFirst([...added, ...notifications]));
    await this.data.add(added);
  }

  async restore(notification: AppNotification): Promise<void> {
    this.allNotifications.update((notifications) => newestFirst([...notifications, notification]));
    await this.data.restore(notification);
  }
}
