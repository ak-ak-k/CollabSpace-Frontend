import { IconName } from '../../shared/ui/icon/icon-registry';

export type NotificationCategory = 'mention' | 'message' | 'task' | 'team' | 'system';

export type NotificationFilter = NotificationCategory | 'all';

export interface AppNotification {
  readonly workspaceId: string;
  readonly id: string;
  readonly category: NotificationCategory;
  readonly actorId: string | null;
  readonly text: string;
  readonly snippet: string;
  readonly createdAt: number;
  readonly read: boolean;
  readonly route: string | null;
}

export interface NotificationCategoryOption {
  readonly id: NotificationFilter;
  readonly label: string;
  readonly icon: IconName;
}

export const NOTIFICATION_CATEGORIES: readonly NotificationCategoryOption[] = [
  { id: 'all', label: 'All', icon: 'inbox' },
  { id: 'mention', label: 'Mentions', icon: 'at-sign' },
  { id: 'message', label: 'Messages', icon: 'message-square' },
  { id: 'task', label: 'Tasks', icon: 'square-kanban' },
  { id: 'team', label: 'Team activity', icon: 'users' },
  { id: 'system', label: 'System', icon: 'shield-check' },
];
