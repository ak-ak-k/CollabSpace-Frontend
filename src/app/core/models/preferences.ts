import { IconName } from '../../shared/ui/icon/icon-registry';

export type NotificationChannel = 'desktop' | 'mobile' | 'email';

export type NotificationTopic = 'mentions' | 'dms' | 'tasks' | 'team' | 'system';

export type NotificationMatrix = Readonly<
  Record<NotificationTopic, Readonly<Record<NotificationChannel, boolean>>>
>;

export type Density = 'comfortable' | 'compact';

export type TimeFormat = '12-hour' | '24-hour';

export interface Preferences {
  readonly notifications: NotificationMatrix;
  readonly sounds: boolean;
  readonly doNotDisturb: boolean;
  readonly showStatus: boolean;
  readonly readReceipts: boolean;
  readonly typingIndicators: boolean;
  readonly profileVisibility: string;
  readonly twoFactor: boolean;
  readonly density: Density;
  readonly language: string;
  readonly timeFormat: TimeFormat;
  readonly weekStart: string;
  readonly reduceMotion: boolean;
  readonly enterToSend: boolean;
  readonly statusMessage: string;
  readonly displayName: string;
  readonly pronouns: string;
}

export type BooleanPreference = {
  [Key in keyof Preferences]: Preferences[Key] extends boolean ? Key : never;
}[keyof Preferences];

export interface DeviceSession {
  readonly id: string;
  readonly device: string;
  readonly icon: IconName;
  readonly location: string;
  readonly lastActive: string;
  readonly current: boolean;
}

export interface Integration {
  readonly id: string;
  readonly name: string;
  readonly icon: IconName;
  readonly description: string;
  readonly connected: boolean;
}

export interface RolePermission {
  readonly label: string;
  readonly allowed: readonly boolean[];
}

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = ['desktop', 'mobile', 'email'];

export const NOTIFICATION_TOPICS: readonly NotificationTopic[] = [
  'mentions',
  'dms',
  'tasks',
  'team',
  'system',
];
