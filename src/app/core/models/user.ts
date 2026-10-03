export type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface User {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly department: string;
  readonly email: string;
  readonly phone?: string;
  readonly status: PresenceStatus;
  readonly lastSeenAt?: number;
  readonly lastActiveAt?: number;
  readonly timeZone: string;
  readonly timeZoneLabel: string;
  readonly location: string;
  readonly role: WorkspaceRole;
  readonly joinedLabel?: string;
  readonly bio?: string;
}

export interface PresenceOption {
  readonly status: PresenceStatus;
  readonly label: string;
}

export const PRESENCE_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do not disturb',
  offline: 'Offline',
};

export const PRESENCE_OPTIONS: readonly PresenceOption[] = [
  { status: 'online', label: 'Online' },
  { status: 'away', label: 'Away' },
  { status: 'dnd', label: 'Do not disturb' },
  { status: 'offline', label: 'Appear offline' },
];

const USER_ID_PREFIX_LENGTH = 1;

export const userColorSeed = (userId: string): number =>
  Number.parseInt(userId.slice(USER_ID_PREFIX_LENGTH), 10) || 0;

export const firstNameOf = (name: string): string => name.split(' ')[0] ?? name;
