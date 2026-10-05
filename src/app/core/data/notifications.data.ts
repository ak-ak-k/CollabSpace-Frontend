import { inject, Service } from '@angular/core';
import { MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';
import { AppNotification, NotificationFilter } from '../models/notification';
import { MockRequest } from './mock-request';

const newestFirst = (notifications: AppNotification[]): AppNotification[] =>
  notifications.sort((first, second) => second.createdAt - first.createdAt);

@Service()
export class NotificationsData {
  private readonly request = inject(MockRequest);

  private notifications = [...MOCK_NOTIFICATIONS];

  getNotifications(): Promise<readonly AppNotification[]> {
    return this.request.read(() => this.notifications, []);
  }

  markRead(id: string, read: boolean): Promise<void> {
    return this.request.write(() => {
      this.notifications = this.notifications.map((notification) =>
        notification.id === id ? { ...notification, read } : notification,
      );
    });
  }

  markAllRead(filter: NotificationFilter, workspaceId: string): Promise<void> {
    return this.request.write(() => {
      this.notifications = this.notifications.map((notification) =>
        notification.workspaceId === workspaceId &&
        (filter === 'all' || notification.category === filter)
          ? { ...notification, read: true }
          : notification,
      );
    });
  }

  dismiss(id: string): Promise<void> {
    return this.request.write(() => {
      this.notifications = this.notifications.filter((notification) => notification.id !== id);
    });
  }

  add(added: readonly AppNotification[]): Promise<void> {
    return this.request.write(() => {
      this.notifications = newestFirst([...added, ...this.notifications]);
    });
  }

  restore(notification: AppNotification): Promise<void> {
    return this.request.write(() => {
      this.notifications = newestFirst([...this.notifications, notification]);
    });
  }
}
