import { formatSegments, mentionsUser, plainTextOf } from './chat-format';

describe('chat formatting', () => {
  it('splits bold, italic, code and mentions into styled segments', () => {
    expect(formatSegments('**Ship** _today_ with `npm ci`, @Aarav')).toEqual([
      { text: 'Ship', style: 'bold', href: null },
      { text: ' ', style: 'plain', href: null },
      { text: 'today', style: 'italic', href: null },
      { text: ' with ', style: 'plain', href: null },
      { text: 'npm ci', style: 'code', href: null },
      { text: ', ', style: 'plain', href: null },
      { text: '@Aarav', style: 'mention', href: null },
    ]);
  });

  it('links http and https addresses and leaves trailing punctuation outside the link', () => {
    expect(formatSegments('See https://example.com/a_b.')).toEqual([
      { text: 'See ', style: 'plain', href: null },
      { text: 'https://example.com/a_b', style: 'link', href: 'https://example.com/a_b' },
      { text: '.', style: 'plain', href: null },
    ]);
    expect(formatSegments('javascript:alert(1)').every((part) => part.style === 'plain')).toBe(
      true,
    );
  });

  it('keeps snake_case words and unmatched markers as plain text', () => {
    expect(formatSegments('use snake_case_names and 2 * 3')).toEqual([
      { text: 'use snake_case_names and 2 * 3', style: 'plain', href: null },
    ]);
  });

  it('knows when a message mentions the reader directly or through @here', () => {
    expect(mentionsUser('@Aarav can you look?', 'Aarav')).toBe(true);
    expect(mentionsUser('@here standup moved', 'Aarav')).toBe(true);
    expect(mentionsUser('@Priya can you look?', 'Aarav')).toBe(false);
  });

  it('drops formatting markers for plain previews', () => {
    expect(plainTextOf('**Ship** _today_ with `npm ci`, @Aarav')).toBe(
      'Ship today with npm ci, @Aarav',
    );
    expect(plainTextOf('use snake_case_names and 2 * 3')).toBe('use snake_case_names and 2 * 3');
  });
});
