import { TestBed } from '@angular/core/testing';
import { NotificationState } from './notification.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';

describe('NotificationState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  it('counts unread notifications overall and per category', async () => {
    const notifications = TestBed.inject(NotificationState);
    await settle();

    expect(notifications.unreadCount()).toBe(5);
    expect(notifications.unreadMentionCount()).toBe(2);
    expect(notifications.unreadCountFor('task')).toBe(1);
  });

  it('marks a category as read', async () => {
    const notifications = TestBed.inject(NotificationState);
    await settle();

    await notifications.markAllRead('mention');

    expect(notifications.unreadMentionCount()).toBe(0);
    expect(notifications.unreadCount()).toBe(3);
  });

  it('dismisses and restores a notification in date order', async () => {
    const notifications = TestBed.inject(NotificationState);
    await settle();

    const dismissed = await notifications.dismiss('n3');
    const idsAfterDismiss = notifications.notifications().map((notification) => notification.id);
    expect(idsAfterDismiss).not.toContain('n3');

    if (dismissed) {
      await notifications.restore(dismissed);
    }
    const restored = notifications.notifications();
    const newestFirst = [...restored].sort((first, second) => second.createdAt - first.createdAt);
    expect(restored.map((notification) => notification.id)).toContain('n3');
    expect(restored).toEqual(newestFirst);
  });
});
