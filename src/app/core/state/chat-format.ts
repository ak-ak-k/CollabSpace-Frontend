import { TextSegment, TextStyle } from '../models/thread';

interface Piece {
  readonly part: string;
  readonly matched: boolean;
}

const FORMAT_PATTERN = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\b_[^_\n]+_\b|https?:\/\/[^\s]+)/;
const MENTION_PATTERN = /(@(?:here|everyone|channel)\b|@[A-Z][a-z]+|#[a-z][a-z0-9-]*|NS-\d+)/;
const SPECIAL_MENTION = /@(?:here|everyone|channel)\b/;
const TRAILING_PUNCTUATION = /[.,!?)]+$/;
const CODE_MARK = '`';
const BOLD_MARK = '**';
const ITALIC_MARK = '_';

const segment = (text: string, style: TextStyle, href: string | null = null): TextSegment => ({
  text,
  style,
  href,
});

const piecesOf = (text: string, pattern: RegExp): Piece[] =>
  text
    .split(pattern)
    .map((part, index) => ({ part, matched: index % 2 === 1 }))
    .filter(({ part }) => part !== '');

const unwrap = (token: string, mark: string): string => token.slice(mark.length, -mark.length);

export const mentionSegments = (text: string): TextSegment[] =>
  piecesOf(text, MENTION_PATTERN).map(({ part, matched }) =>
    segment(part, matched ? 'mention' : 'plain'),
  );

const linkSegments = (token: string): TextSegment[] => {
  const href = token.replace(TRAILING_PUNCTUATION, '');
  return [segment(href, 'link', href), ...mentionSegments(token.slice(href.length))];
};

const formattedSegments = (token: string): TextSegment[] => {
  if (token.startsWith(CODE_MARK)) {
    return [segment(unwrap(token, CODE_MARK), 'code')];
  }
  if (token.startsWith(BOLD_MARK)) {
    return [segment(unwrap(token, BOLD_MARK), 'bold')];
  }
  if (token.startsWith(ITALIC_MARK)) {
    return [segment(unwrap(token, ITALIC_MARK), 'italic')];
  }
  return linkSegments(token);
};

export const formatSegments = (text: string): TextSegment[] =>
  piecesOf(text, FORMAT_PATTERN).flatMap(({ part, matched }) =>
    matched ? formattedSegments(part) : mentionSegments(part),
  );

export const plainTextOf = (text: string): string =>
  formatSegments(text)
    .map((part) => part.text)
    .join('');

export const mentionsUser = (text: string, firstName: string): boolean =>
  (firstName !== '' && text.includes(`@${firstName}`)) || SPECIAL_MENTION.test(text);
