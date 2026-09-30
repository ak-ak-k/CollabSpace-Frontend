import { MentionCandidate } from '../../../core/models/thread';

export interface CaretEdit {
  readonly text: string;
  readonly caret: number;
}

export interface MentionMatch {
  readonly query: string;
  readonly start: number;
  readonly end: number;
}

const MENTION_PATTERN = /(^|\s)@([A-Za-z]*)$/;
const TRAILING_WHITESPACE = /\s$/;
const MENTION_TRIGGER = '@';

export const MAX_MENTION_CANDIDATES = 5;

const clampCaret = (text: string, caret: number): number =>
  Math.min(Math.max(caret, 0), text.length);

export const insertAtCaret = (text: string, caret: number, insertion: string): CaretEdit => {
  const position = clampCaret(text, caret);
  return {
    text: text.slice(0, position) + insertion + text.slice(position),
    caret: position + insertion.length,
  };
};

export const findMentionMatch = (text: string, caret: number): MentionMatch | null => {
  const end = clampCaret(text, caret);
  const match = MENTION_PATTERN.exec(text.slice(0, end));
  if (!match) {
    return null;
  }
  const query = match[2];
  return { query, start: end - query.length - MENTION_TRIGGER.length, end };
};

export const replaceMention = (text: string, match: MentionMatch, firstName: string): CaretEdit => {
  const insertion = `${MENTION_TRIGGER}${firstName} `;
  return {
    text: text.slice(0, match.start) + insertion + text.slice(match.end),
    caret: match.start + insertion.length,
  };
};

export const mentionTriggerFor = (text: string, caret: number): string => {
  const before = text.slice(0, clampCaret(text, caret));
  return before === '' || TRAILING_WHITESPACE.test(before)
    ? MENTION_TRIGGER
    : ` ${MENTION_TRIGGER}`;
};

export const filterMentionCandidates = (
  members: readonly MentionCandidate[],
  query: string,
): readonly MentionCandidate[] => {
  const needle = query.toLowerCase();
  return members
    .filter(
      (member) =>
        member.firstName.toLowerCase().startsWith(needle) ||
        member.name.toLowerCase().includes(needle),
    )
    .slice(0, MAX_MENTION_CANDIDATES);
};
