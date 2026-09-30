const APPLE_PLATFORM = /Mac|iPhone|iPad|iPod/;

export const APPLE_PALETTE_SHORTCUT = '⌘K';
export const DEFAULT_PALETTE_SHORTCUT = 'Ctrl K';

export const paletteShortcutFor = (userAgent: string): string =>
  APPLE_PLATFORM.test(userAgent) ? APPLE_PALETTE_SHORTCUT : DEFAULT_PALETTE_SHORTCUT;
