import { IconName } from '../shared/ui/icon/icon-registry';

export type NavigationBadge = 'messages' | 'notifications';

export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly accessibleLabel: string;
  readonly icon: IconName;
  readonly route: string;
  readonly badge?: NavigationBadge;
}

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { id: 'home', label: 'Home', accessibleLabel: 'Home', icon: 'house', route: '/home' },
  {
    id: 'messages',
    label: 'Messages',
    accessibleLabel: 'Messages',
    icon: 'message-square',
    route: '/messages',
    badge: 'messages',
  },
  { id: 'teams', label: 'Teams', accessibleLabel: 'Teams', icon: 'users', route: '/teams' },
  {
    id: 'tasks',
    label: 'Tasks',
    accessibleLabel: 'Tasks',
    icon: 'square-kanban',
    route: '/tasks',
  },
  { id: 'files', label: 'Files', accessibleLabel: 'Files', icon: 'folder', route: '/files' },
  {
    id: 'notifications',
    label: 'Alerts',
    accessibleLabel: 'Notifications',
    icon: 'bell',
    route: '/notifications',
    badge: 'notifications',
  },
];

const BOTTOM_NAVIGATION_IDS = ['home', 'messages', 'teams', 'tasks'];

export const BOTTOM_NAVIGATION: readonly NavigationItem[] = PRIMARY_NAVIGATION.filter((item) =>
  BOTTOM_NAVIGATION_IDS.includes(item.id),
);

export const DRAWER_NAVIGATION: readonly NavigationItem[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    accessibleLabel: 'Workspace',
    icon: 'building-2',
    route: '/workspace',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    accessibleLabel: 'Notifications',
    icon: 'bell',
    route: '/notifications',
    badge: 'notifications',
  },
  { id: 'files', label: 'Files', accessibleLabel: 'Files', icon: 'folder', route: '/files' },
  { id: 'profile', label: 'Profile', accessibleLabel: 'Profile', icon: 'user', route: '/profile' },
  {
    id: 'settings',
    label: 'Settings',
    accessibleLabel: 'Settings',
    icon: 'settings',
    route: '/settings/account',
  },
];

export const MORE_SECTION_ROUTES: readonly string[] = [
  '/workspace',
  '/files',
  '/notifications',
  '/profile',
  '/settings',
];

export const SETTINGS_ROUTE = '/settings/account';
export const SETTINGS_SECTION_ROUTE = '/settings';
