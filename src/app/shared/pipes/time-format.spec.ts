import { formatLocalTime, fromDateInputValue, toDateInputValue } from './time-format';

describe('date input helpers', () => {
  it('formats a local date as yyyy-mm-dd', () => {
    expect(toDateInputValue(new Date(2026, 0, 5, 0, 0).getTime())).toBe('2026-01-05');
  });

  it('parses a date input value as local midnight and rejects invalid values', () => {
    expect(fromDateInputValue('2026-01-05')).toBe(new Date(2026, 0, 5).getTime());
    expect(fromDateInputValue('')).toBeNull();
  });
});

describe('formatLocalTime', () => {
  const noonUtc = Date.UTC(2026, 0, 5, 12, 0);

  it('shows the time in the given zone in 12-hour or 24-hour form', () => {
    expect(formatLocalTime('Asia/Kolkata', noonUtc)).toBe('5:30 PM');
    expect(formatLocalTime('Asia/Kolkata', noonUtc, true)).toBe('17:30');
  });
});
