import {
  findMentionMatch,
  insertAtCaret,
  mentionTriggerFor,
  replaceMention,
} from './composer-text';

describe('composer text helpers', () => {
  it('inserts at the caret rather than at the end', () => {
    expect(insertAtCaret('ab', 1, '😀')).toEqual({ text: 'a😀b', caret: 3 });
  });

  it('detects a person or channel mention only just before the caret', () => {
    expect(findMentionMatch('hi @an later', 6)).toEqual({
      trigger: '@',
      query: 'an',
      start: 3,
      end: 6,
    });
    expect(findMentionMatch('see #fro', 8)).toEqual({
      trigger: '#',
      query: 'fro',
      start: 4,
      end: 8,
    });
    expect(findMentionMatch('hi @an later', 12)).toBeNull();
    expect(findMentionMatch('mail@an', 7)).toBeNull();
  });

  it('replaces the query with the chosen token and a trailing space', () => {
    const match = findMentionMatch('hi @an later', 6);
    expect(replaceMention('hi @an later', match!, '@Ananya')).toEqual({
      text: 'hi @Ananya  later',
      caret: 11,
    });
  });

  it('adds a leading space to the trigger only after a word', () => {
    expect(mentionTriggerFor('', 0)).toBe('@');
    expect(mentionTriggerFor('hi ', 3)).toBe('@');
    expect(mentionTriggerFor('hi', 2)).toBe(' @');
  });
});
