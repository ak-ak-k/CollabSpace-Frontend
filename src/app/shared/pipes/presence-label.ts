import { PRESENCE_LABELS, User } from '../../core/models/user';
import { formatRelative } from './time-format';

const LOWERCASE_RELATIVE_LABELS: ReadonlySet<string> = new Set(['Just now', 'Yesterday']);

export const presenceLabelOf = (user: User, now = Date.now()): string => {
  if (user.status !== 'offline') {
    return PRESENCE_LABELS[user.status];
  }
  if (!user.lastSeenAt) {
    return PRESENCE_LABELS.offline;
  }
  const relative = formatRelative(user.lastSeenAt, now);
  return `Last seen ${LOWERCASE_RELATIVE_LABELS.has(relative) ? relative.toLowerCase() : relative}`;
};
