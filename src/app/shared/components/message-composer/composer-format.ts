import { IconName } from '../../ui/icon/icon-registry';

export type FormatMark = 'bold' | 'italic' | 'code' | 'link';

export interface SelectionEdit {
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

export interface FormatTool {
  readonly mark: FormatMark;
  readonly label: string;
  readonly icon: IconName;
}

export const FORMAT_TOOLS: readonly FormatTool[] = [
  { mark: 'bold', label: 'Bold (Ctrl+B)', icon: 'bold' },
  { mark: 'italic', label: 'Italic (Ctrl+I)', icon: 'italic' },
  { mark: 'code', label: 'Code (Ctrl+E)', icon: 'code' },
  { mark: 'link', label: 'Link', icon: 'link' },
];

const MARKERS: Record<Exclude<FormatMark, 'link'>, string> = {
  bold: '**',
  italic: '_',
  code: '`',
};
const SHORTCUTS: Readonly<Record<string, FormatMark>> = { b: 'bold', i: 'italic', e: 'code' };
const PLACEHOLDER_TEXT = 'text';
const LINK_PREFIX = 'https://';
const URL_START = /^https?:\/\//;

export const wrapSelection = (
  text: string,
  start: number,
  end: number,
  mark: FormatMark,
): SelectionEdit => {
  const before = text.slice(0, start);
  const selected = text.slice(start, end);
  const after = text.slice(end);
  if (mark === 'link') {
    const link = URL_START.test(selected) ? selected : `${LINK_PREFIX}${selected}`;
    const caret = start + link.length;
    return { text: `${before}${link}${after}`, start: caret, end: caret };
  }
  const marker = MARKERS[mark];
  const inner = selected || PLACEHOLDER_TEXT;
  const innerStart = start + marker.length;
  return {
    text: `${before}${marker}${inner}${marker}${after}`,
    start: innerStart,
    end: innerStart + inner.length,
  };
};

export const formatShortcutOf = (event: KeyboardEvent): FormatMark | null => {
  const modified = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey;
  return modified ? (SHORTCUTS[event.key.toLowerCase()] ?? null) : null;
};
