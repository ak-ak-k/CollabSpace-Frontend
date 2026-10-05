import { formatDate, isSameDay } from '../../shared/pipes/time-format';

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MINUTES_PER_HOUR = 60;

const FULL_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const compactWhenOf = (timestamp: number, now: number): string => {
  const minutes = Math.floor((now - timestamp) / MILLISECONDS_PER_MINUTE);
  if (minutes < 1) {
    return 'Now';
  }
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes}m`;
  }
  if (isSameDay(timestamp, now)) {
    return `${Math.floor(minutes / MINUTES_PER_HOUR)}h`;
  }
  if (isSameDay(timestamp, now - MILLISECONDS_PER_DAY)) {
    return 'Yesterday';
  }
  return formatDate(timestamp, { day: 'numeric', month: 'short' });
};

export const fullDateOf = (timestamp: number): string =>
  new Date(timestamp).toLocaleString('en-GB', FULL_DATE_FORMAT);

export const isoDateOf = (timestamp: number): string => new Date(timestamp).toISOString();
