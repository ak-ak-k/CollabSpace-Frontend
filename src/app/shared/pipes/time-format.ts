const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MINUTES_PER_HOUR = 60;
const RECENT_DAYS = 6;

export interface DueLabel {
  readonly label: string;
  readonly overdue: boolean;
  readonly soon: boolean;
  readonly daysFromToday: number;
}

export const isSameDay = (first: number, second: number): boolean =>
  new Date(first).toDateString() === new Date(second).toDateString();

export const startOfDay = (timestamp: number): number => {
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

export const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const formatDate = (timestamp: number, options: Intl.DateTimeFormatOptions): string =>
  new Date(timestamp).toLocaleDateString('en-GB', options);

const formatWeekday = (timestamp: number, weekday: 'short' | 'long'): string =>
  new Date(timestamp).toLocaleDateString('en-US', { weekday });

const isWithinRecentDays = (timestamp: number, now: number): boolean =>
  now - timestamp < RECENT_DAYS * MILLISECONDS_PER_DAY;

export const formatWhen = (timestamp: number, now = Date.now()): string => {
  if (isSameDay(timestamp, now)) {
    return formatTime(timestamp);
  }
  if (isSameDay(timestamp, now - MILLISECONDS_PER_DAY)) {
    return 'Yesterday';
  }
  return isWithinRecentDays(timestamp, now)
    ? formatWeekday(timestamp, 'short')
    : formatDate(timestamp, { day: 'numeric', month: 'short' });
};

export const formatDayLabel = (timestamp: number, now = Date.now()): string => {
  if (isSameDay(timestamp, now)) {
    return 'Today';
  }
  if (isSameDay(timestamp, now - MILLISECONDS_PER_DAY)) {
    return 'Yesterday';
  }
  return isWithinRecentDays(timestamp, now)
    ? formatWeekday(timestamp, 'long')
    : formatDate(timestamp, { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatRelative = (timestamp: number, now = Date.now()): string => {
  const minutes = Math.round((now - timestamp) / MILLISECONDS_PER_MINUTE);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes}m ago`;
  }
  return isSameDay(timestamp, now)
    ? `${Math.round(minutes / MINUTES_PER_HOUR)}h ago`
    : formatWhen(timestamp, now);
};

const NAMED_DUE_DAYS: Readonly<Record<number, string>> = {
  [-1]: 'Yesterday',
  0: 'Today',
  1: 'Tomorrow',
};

export const dueLabelOf = (timestamp: number, now = Date.now()): DueLabel => {
  const daysFromToday = Math.round(
    (startOfDay(timestamp) - startOfDay(now)) / MILLISECONDS_PER_DAY,
  );
  return {
    label:
      NAMED_DUE_DAYS[daysFromToday] ?? formatDate(timestamp, { day: 'numeric', month: 'short' }),
    overdue: daysFromToday < 0,
    soon: daysFromToday === 0 || daysFromToday === 1,
    daysFromToday,
  };
};

export const formatLocalTime = (timeZone: string, now = Date.now()): string => {
  try {
    return new Date(now).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    });
  } catch {
    return '';
  }
};
