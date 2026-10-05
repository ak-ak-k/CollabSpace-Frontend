import { FormatMark, formatShortcutOf } from './composer-format';

export type ComposerKeyCommand =
  | { readonly kind: 'mention-move'; readonly step: number }
  | { readonly kind: 'mention-pick' }
  | { readonly kind: 'mention-dismiss' }
  | { readonly kind: 'format'; readonly mark: FormatMark }
  | { readonly kind: 'send' }
  | { readonly kind: 'edit-last' }
  | { readonly kind: 'escape' };

export interface ComposerKeyContext {
  readonly mentionOpen: boolean;
  readonly draftEmpty: boolean;
  readonly sendsOnEnter: boolean;
}

const mentionCommand = (key: string): ComposerKeyCommand | null => {
  switch (key) {
    case 'ArrowDown':
      return { kind: 'mention-move', step: 1 };
    case 'ArrowUp':
      return { kind: 'mention-move', step: -1 };
    case 'Enter':
    case 'Tab':
      return { kind: 'mention-pick' };
    case 'Escape':
      return { kind: 'mention-dismiss' };
    default:
      return null;
  }
};

const sendsOn = (event: KeyboardEvent, sendsOnEnter: boolean): boolean => {
  if (event.isComposing || event.shiftKey) {
    return false;
  }
  return sendsOnEnter || event.ctrlKey || event.metaKey;
};

export const composerKeyCommand = (
  event: KeyboardEvent,
  context: ComposerKeyContext,
): ComposerKeyCommand | null => {
  const mention = context.mentionOpen ? mentionCommand(event.key) : null;
  if (mention) {
    return mention;
  }
  const mark = formatShortcutOf(event);
  if (mark) {
    return { kind: 'format', mark };
  }
  if (event.key === 'Enter') {
    return sendsOn(event, context.sendsOnEnter) ? { kind: 'send' } : null;
  }
  if (event.key === 'ArrowUp') {
    return context.draftEmpty ? { kind: 'edit-last' } : null;
  }
  return event.key === 'Escape' ? { kind: 'escape' } : null;
};
