const PALETTE_KEY = 'k';
const QUICK_SEARCH_KEY = '/';
const TYPING_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'];

export const isPaletteShortcut = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === PALETTE_KEY;

export const isQuickSearchKey = (event: KeyboardEvent): boolean =>
  event.key === QUICK_SEARCH_KEY && !event.metaKey && !event.ctrlKey && !event.altKey;

export const isTypingTarget = (event: KeyboardEvent): boolean => {
  const target = event.target;
  return (
    target instanceof HTMLElement &&
    (TYPING_ELEMENTS.includes(target.tagName) || target.isContentEditable === true)
  );
};
