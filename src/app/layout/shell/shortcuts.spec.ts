import { isPaletteShortcut, isQuickSearchKey, isTypingTarget } from './shortcuts';

const keydown = (init: KeyboardEventInit, target: HTMLElement = document.body): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { bubbles: true, ...init });
  Object.defineProperty(event, 'target', { value: target });
  return event;
};

describe('shell shortcuts', () => {
  it('recognises Ctrl+K and Cmd+K', () => {
    expect(isPaletteShortcut(keydown({ key: 'k', ctrlKey: true }))).toBe(true);
    expect(isPaletteShortcut(keydown({ key: 'K', metaKey: true }))).toBe(true);
    expect(isPaletteShortcut(keydown({ key: 'k' }))).toBe(false);
  });

  it('recognises the slash key without modifiers', () => {
    expect(isQuickSearchKey(keydown({ key: '/' }))).toBe(true);
    expect(isQuickSearchKey(keydown({ key: '/', ctrlKey: true }))).toBe(false);
  });

  it('knows when the person is typing in a field', () => {
    expect(isTypingTarget(keydown({ key: '/' }, document.createElement('input')))).toBe(true);
    expect(isTypingTarget(keydown({ key: '/' }, document.createElement('button')))).toBe(false);
  });
});
