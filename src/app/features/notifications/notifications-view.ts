import {
  AppNotification,
  NOTIFICATION_CATEGORIES,
  NotificationCategoryOption,
  NotificationFilter,
} from '../../core/models/notification';
import { User, userColorSeed } from '../../core/models/user';
import { formatDayLabel, formatRelative } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';

export type NotificationShowFilter = 'all' | 'unread';

export interface NotificationRowView {
  readonly id: string;
  readonly actorName: string | null;
  readonly avatarSeed: number;
  readonly systemIcon: IconName;
  readonly text: string;
  readonly snippet: string;
  readonly summary: string;
  readonly categoryLabel: string;
  readonly categoryIcon: IconName;
  readonly when: string;
  readonly unread: boolean;
  readonly route: string | null;
}

export interface NotificationGroupView {
  readonly label: string;
  readonly rows: readonly NotificationRowView[];
}

export interface NotificationCategoryView extends NotificationCategoryOption {
  readonly unreadCount: number;
  readonly link: string;
  readonly current: boolean;
}

const NOTIFICATIONS_ROUTE = '/notifications';
const SIGN_IN_TEXT = /sign-in/i;
const CATEGORY_BY_ID = new Map(NOTIFICATION_CATEGORIES.map((option) => [option.id, option]));

export const isNotificationFilter = (value: string | undefined): value is NotificationFilter =>
  value !== undefined && CATEGORY_BY_ID.has(value as NotificationFilter);

export const notificationFilterOf = (value: string | undefined): NotificationFilter =>
  isNotificationFilter(value) ? value : 'all';

export const categoryLinkOf = (filter: NotificationFilter): string =>
  filter === 'all' ? NOTIFICATIONS_ROUTE : `${NOTIFICATIONS_ROUTE}/${filter}`;

export const matchesNotificationFilter = (
  notification: AppNotification,
  filter: NotificationFilter,
): boolean => filter === 'all' || notification.category === filter;

export const visibleNotifications = (
  notifications: readonly AppNotification[],
  filter: NotificationFilter,
  show: NotificationShowFilter,
): readonly AppNotification[] =>
  notifications
    .filter(
      (notification) =>
        matchesNotificationFilter(notification, filter) && (show === 'all' || !notification.read),
    )
    .sort((first, second) => second.createdAt - first.createdAt);

const rowViewOf = (
  notification: AppNotification,
  actor: User | null,
  now: number,
): NotificationRowView => {
  const category = CATEGORY_BY_ID.get(notification.category);
  const actorName = actor?.name ?? null;
  return {
    id: notification.id,
    actorName,
    avatarSeed: actor ? userColorSeed(actor.id) : 0,
    systemIcon: SIGN_IN_TEXT.test(notification.text) ? 'shield-check' : 'triangle-alert',
    text: notification.text,
    snippet: notification.snippet,
    summary: actorName ? `${actorName} ${notification.text}` : notification.text,
    categoryLabel: category?.label ?? '',
    categoryIcon: category?.icon ?? 'inbox',
    when: formatRelative(notification.createdAt, now),
    unread: !notification.read,
    route: notification.route,
  };
};

export const groupNotificationsByDay = (
  notifications: readonly AppNotification[],
  usersById: ReadonlyMap<string, User>,
  now: number,
): readonly NotificationGroupView[] => {
  const groups = new Map<string, NotificationRowView[]>();
  for (const notification of notifications) {
    const label = formatDayLabel(notification.createdAt, now);
    const actor = notification.actorId ? (usersById.get(notification.actorId) ?? null) : null;
    const rows = groups.get(label) ?? [];
    rows.push(rowViewOf(notification, actor, now));
    groups.set(label, rows);
  }
  return [...groups].map(([label, rows]) => ({ label, rows }));
};

export const notificationSummaryOf = (unread: number, total: number, ready: boolean): string => {
  if (!ready) {
    return 'Mentions, messages, tasks and updates in one place';
  }
  return unread > 0 ? `${unread} unread · ${total} total` : 'No unread notifications';
};

export const emptyMessageOf = (show: NotificationShowFilter): string =>
  show === 'unread'
    ? 'No unread notifications here. Switch to All to see earlier ones.'
    : 'New mentions, messages and task updates will show up here.';
