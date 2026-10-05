import { PRESENCE_LABELS, User } from '../models/user';
import { formatRelative } from '../../shared/pipes/time-format';

const MILLISECONDS_PER_DAY = 86_400_000;
const WEEKDAY_WINDOW_DAYS = 6;
const LOWERCASE_PHRASES: ReadonlySet<string> = new Set(['Just now', 'Yesterday']);

export const relativePhrase = (timestamp: number, now = Date.now()): string => {
  const relative = formatRelative(timestamp, now);
  if (LOWERCASE_PHRASES.has(relative)) {
    return relative.toLowerCase();
  }
  if (relative.endsWith('ago')) {
    return relative;
  }
  const withinWeek = now - timestamp < WEEKDAY_WINDOW_DAYS * MILLISECONDS_PER_DAY;
  const weekday = new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
  return `on ${withinWeek ? weekday : relative}`;
};

export const isActiveNow = (user: User): boolean =>
  user.status === 'online' || user.status === 'dnd';

export const statusLineOf = (user: User, now = Date.now()): string => {
  if (user.status === 'offline') {
    return user.lastSeenAt
      ? `Offline · active ${relativePhrase(user.lastSeenAt, now)}`
      : PRESENCE_LABELS.offline;
  }
  if (user.status === 'away' && user.lastActiveAt) {
    return `Away · active ${relativePhrase(user.lastActiveAt, now)}`;
  }
  return PRESENCE_LABELS[user.status];
};

export const lastActiveAtOf = (user: User, now = Date.now()): number =>
  isActiveNow(user) ? now : (user.lastActiveAt ?? user.lastSeenAt ?? 0);

export const wasActiveWithinDay = (user: User, now = Date.now()): boolean => {
  const activeAt = lastActiveAtOf(user, now);
  return activeAt > 0 && now - activeAt < MILLISECONDS_PER_DAY;
};
