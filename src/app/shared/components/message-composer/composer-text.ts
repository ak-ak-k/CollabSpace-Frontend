import { MentionTrigger } from '../../../core/models/thread';

export interface CaretEdit {
  readonly text: string;
  readonly caret: number;
}

export interface MentionMatch {
  readonly trigger: MentionTrigger;
  readonly query: string;
  readonly start: number;
  readonly end: number;
}

const PERSON_PATTERN = /(^|\s)@([A-Za-z]*)$/;
const CHANNEL_PATTERN = /(^|\s)#([a-z0-9-]*)$/;
const TRAILING_WHITESPACE = /\s$/;
const MENTION_TRIGGER = '@';

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
  const before = text.slice(0, end);
  const person = PERSON_PATTERN.exec(before);
  const channel = person ? null : CHANNEL_PATTERN.exec(before);
  const match = person ?? channel;
  if (!match) {
    return null;
  }
  const query = match[2];
  return { trigger: person ? '@' : '#', query, start: end - query.length - 1, end };
};

export const replaceMention = (text: string, match: MentionMatch, token: string): CaretEdit => {
  const insertion = `${token} `;
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
