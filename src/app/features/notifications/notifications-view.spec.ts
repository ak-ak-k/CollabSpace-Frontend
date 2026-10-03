import { AppNotification } from '../../core/models/notification';
import {
  groupNotificationsByDay,
  notificationFilterOf,
  notificationSummaryOf,
  visibleNotifications,
} from './notifications-view';

const NOW = new Date(2026, 9, 3, 12, 0).getTime();
const HOUR = 3_600_000;

const notification = (id: string, hoursAgo: number, read: boolean): AppNotification => ({
  id,
  workspaceId: 'w1',
  category: 'mention',
  actorId: null,
  text: 'Scheduled maintenance',
  snippet: '',
  createdAt: NOW - hoursAgo * HOUR,
  read,
  route: null,
});

describe('notifications view', () => {
  it('falls back to all for unknown categories', () => {
    expect(notificationFilterOf('mention')).toBe('mention');
    expect(notificationFilterOf('unknown')).toBe('all');
    expect(notificationFilterOf(undefined)).toBe('all');
  });

  it('filters unread items newest first and groups them by day', () => {
    const items = [
      notification('a', 30, false),
      notification('b', 1, false),
      notification('c', 2, true),
    ];
    const visible = visibleNotifications(items, 'all', 'unread');
    const groups = groupNotificationsByDay(visible, new Map(), NOW);

    expect(visible.map((item) => item.id)).toEqual(['b', 'a']);
    expect(groups.map((group) => group.label)).toEqual(['Today', 'Yesterday']);
  });

  it('summarises counts only when the list is ready', () => {
    expect(notificationSummaryOf(2, 5, true)).toBe('2 unread · 5 total');
    expect(notificationSummaryOf(0, 5, true)).toBe('No unread notifications');
    expect(notificationSummaryOf(2, 5, false)).toBe(
      'Mentions, messages, tasks and updates in one place',
    );
  });
});
