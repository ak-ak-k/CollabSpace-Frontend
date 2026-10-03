import { inject, Service } from '@angular/core';
import { MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';
import { AppNotification, NotificationFilter } from '../models/notification';
import { MockRequest } from './mock-request';

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

  restore(notification: AppNotification): Promise<void> {
    return this.request.write(() => {
      this.notifications = [...this.notifications, notification].sort(
        (first, second) => second.createdAt - first.createdAt,
      );
    });
  }
}
