const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;

export const MINUTES_PER_DAY = 1440;

const loadedAt = Date.now();

const startOfToday = (): number => {
  const today = new Date(loadedAt);
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

export const minutesAgo = (minutes: number): number => loadedAt - minutes * MILLISECONDS_PER_MINUTE;

export const daysFromToday = (days: number): number => startOfToday() + days * MILLISECONDS_PER_DAY;
