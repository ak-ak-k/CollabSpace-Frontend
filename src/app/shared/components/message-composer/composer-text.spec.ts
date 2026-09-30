import { MentionCandidate } from '../../../core/models/thread';
import {
  filterMentionCandidates,
  findMentionMatch,
  insertAtCaret,
  mentionTriggerFor,
  replaceMention,
} from './composer-text';

const MEMBERS: readonly MentionCandidate[] = [
  { id: 'u2', name: 'Rahul Mehta', firstName: 'Rahul', title: 'Engineer', seed: 1 },
  { id: 'u3', name: 'Ananya Singh', firstName: 'Ananya', title: 'Designer', seed: 2 },
  { id: 'u4', name: 'Meera Rao', firstName: 'Meera', title: 'PM', seed: 3 },
];

describe('composer text helpers', () => {
  it('inserts at the caret rather than at the end', () => {
    expect(insertAtCaret('ab', 1, '😀')).toEqual({ text: 'a😀b', caret: 3 });
  });

  it('detects a mention only just before the caret', () => {
    expect(findMentionMatch('hi @an later', 6)).toEqual({ query: 'an', start: 3, end: 6 });
    expect(findMentionMatch('hi @an later', 12)).toBeNull();
    expect(findMentionMatch('mail@an', 7)).toBeNull();
  });

  it('replaces the query with the first name and a trailing space', () => {
    const match = findMentionMatch('hi @an later', 6);
    expect(replaceMention('hi @an later', match!, 'Ananya')).toEqual({
      text: 'hi @Ananya  later',
      caret: 11,
    });
  });

  it('matches first-name prefixes or full-name substrings, capped at five', () => {
    expect(filterMentionCandidates(MEMBERS, 'me').map((member) => member.firstName)).toEqual([
      'Rahul',
      'Meera',
    ]);
    expect(filterMentionCandidates(MEMBERS, '')).toHaveLength(3);
  });

  it('adds a leading space to the trigger only after a word', () => {
    expect(mentionTriggerFor('', 0)).toBe('@');
    expect(mentionTriggerFor('hi ', 3)).toBe('@');
    expect(mentionTriggerFor('hi', 2)).toBe(' @');
  });
});
