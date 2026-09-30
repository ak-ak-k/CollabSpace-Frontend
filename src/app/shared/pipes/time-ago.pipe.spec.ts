import { TimeAgoPipe } from './time-ago.pipe';
import { dueLabelOf, formatDayLabel } from './time-format';

const MINUTE = 60_000;
const DAY = 86_400_000;
const NOW = new Date(2026, 8, 29, 15, 0, 0).getTime();

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();

  it('describes recent moments relatively', () => {
    expect(pipe.transform(NOW - 20_000, 'relative', NOW)).toBe('Just now');
    expect(pipe.transform(NOW - 12 * MINUTE, 'relative', NOW)).toBe('12m ago');
    expect(pipe.transform(NOW - 130 * MINUTE, 'relative', NOW)).toBe('2h ago');
  });

  it('names yesterday and older days', () => {
    expect(pipe.transform(NOW - DAY, 'when', NOW)).toBe('Yesterday');
    expect(pipe.transform(NOW - 3 * DAY, 'when', NOW)).toBe('Sat');
    expect(pipe.transform(NOW - 10 * DAY, 'when', NOW)).toBe('19 Sept');
  });

  it('returns an empty string without a timestamp', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

describe('time formatting helpers', () => {
  it('labels message days', () => {
    expect(formatDayLabel(NOW, NOW)).toBe('Today');
    expect(formatDayLabel(NOW - DAY, NOW)).toBe('Yesterday');
    expect(formatDayLabel(NOW - 2 * DAY, NOW)).toBe('Sunday');
  });

  it('flags overdue and upcoming due dates', () => {
    expect(dueLabelOf(NOW - DAY, NOW)).toMatchObject({ label: 'Yesterday', overdue: true });
    expect(dueLabelOf(NOW, NOW)).toMatchObject({ label: 'Today', soon: true, overdue: false });
    expect(dueLabelOf(NOW + 5 * DAY, NOW)).toMatchObject({ soon: false, overdue: false });
  });
});
