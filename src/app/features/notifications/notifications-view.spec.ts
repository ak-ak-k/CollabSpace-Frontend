import { AppNotification } from '../../core/models/notification';
import { compactWhenOf } from './notification-time';
import {
  groupNotificationsByDay,
  markAllLabelOf,
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

  it('names the category in the mark all label', () => {
    expect(markAllLabelOf('all')).toBe('Mark all as read');
    expect(markAllLabelOf('team')).toBe('Mark all read in Teams & workspace');
  });

  it('shows compact times and uses the icon of a system notification', () => {
    const reminder = { ...notification('d', 0, false), icon: 'calendar' as const };
    const [group] = groupNotificationsByDay([reminder], new Map(), NOW);

    expect(compactWhenOf(NOW - 20 * 60_000, NOW)).toBe('20m');
    expect(compactWhenOf(NOW - 3 * HOUR, NOW)).toBe('3h');
    expect(compactWhenOf(NOW - 24 * HOUR, NOW)).toBe('Yesterday');
    expect(group.rows[0].systemIcon).toBe('calendar');
    expect(group.rows[0].when).toBe('Now');
  });
});
