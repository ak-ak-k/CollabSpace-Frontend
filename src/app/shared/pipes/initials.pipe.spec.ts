import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
  const pipe = new InitialsPipe();

  it('uses the first letters of the first two words', () => {
    expect(pipe.transform('Aarav Shah')).toBe('AS');
    expect(pipe.transform('launch crew extended')).toBe('LC');
  });

  it('handles single words and extra spaces', () => {
    expect(pipe.transform('  Priya  ')).toBe('P');
  });

  it('returns an empty string for missing names', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
