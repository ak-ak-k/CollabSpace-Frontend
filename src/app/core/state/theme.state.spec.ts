import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeState } from './theme.state';

describe('ThemeState', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts in light mode when nothing is stored', () => {
    const theme = TestBed.inject(ThemeState);

    expect(theme.preference()).toBe('light');
    expect(theme.mode()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('restores the stored preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const theme = TestBed.inject(ThemeState);

    expect(theme.isDark()).toBe(true);
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(TestBed.inject(ThemeState).preference()).toBe('light');
  });

  it('toggles between light and dark and remembers the choice', () => {
    const theme = TestBed.inject(ThemeState);

    theme.toggle();

    expect(theme.mode()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
      '#151413',
    );
  });
});
