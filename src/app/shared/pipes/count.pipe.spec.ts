import { CountPipe, formatCount } from './count.pipe';
import { PluralPipe } from './plural.pipe';

describe('formatCount', () => {
  it('uses the singular word for exactly one', () => {
    expect(formatCount(1, 'member')).toBe('1 member');
  });

  it('adds an s for other counts unless a plural is given', () => {
    expect(formatCount(7, 'member')).toBe('7 members');
    expect(formatCount(0, 'reply', 'replies')).toBe('0 replies');
    expect(new CountPipe().transform(2, 'channel')).toBe('2 channels');
  });
});

describe('PluralPipe', () => {
  it('returns only the word that fits the count', () => {
    expect(new PluralPipe().transform(1, 'channel')).toBe('channel');
    expect(new PluralPipe().transform(3, 'channel')).toBe('channels');
  });
});
