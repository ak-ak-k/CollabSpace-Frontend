import { formatShortcutOf, wrapSelection } from './composer-format';

describe('composer formatting helpers', () => {
  it('wraps the selection in markers and keeps the inner text selected', () => {
    expect(wrapSelection('ship it now', 5, 7, 'bold')).toEqual({
      text: 'ship **it** now',
      start: 7,
      end: 9,
    });
    expect(wrapSelection('run ', 4, 4, 'code')).toEqual({ text: 'run `text`', start: 5, end: 9 });
  });

  it('turns the selection into a link and puts the caret after it', () => {
    expect(wrapSelection('see example.com', 4, 15, 'link')).toEqual({
      text: 'see https://example.com',
      start: 23,
      end: 23,
    });
    expect(wrapSelection('https://a.io', 0, 12, 'link').text).toBe('https://a.io');
  });

  it('maps Ctrl or Cmd with B, I and E to a format and ignores other combinations', () => {
    expect(formatShortcutOf(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))).toBe(
      'bold',
    );
    expect(formatShortcutOf(new KeyboardEvent('keydown', { key: 'I', metaKey: true }))).toBe(
      'italic',
    );
    expect(formatShortcutOf(new KeyboardEvent('keydown', { key: 'e', ctrlKey: true }))).toBe(
      'code',
    );
    expect(
      formatShortcutOf(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, shiftKey: true })),
    ).toBeNull();
    expect(formatShortcutOf(new KeyboardEvent('keydown', { key: 'b' }))).toBeNull();
  });
});
