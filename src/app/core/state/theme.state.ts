import { computed, DOCUMENT, inject, Service, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export const THEME_STORAGE_KEY = 'collabspace.theme';

const DEFAULT_PREFERENCE: ThemePreference = 'light';
const PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLORS: Record<ThemeMode, string> = { light: '#f3f2f2', dark: '#151413' };

@Service()
export class ThemeState {
  private readonly document = inject(DOCUMENT);
  private readonly systemPrefersDark = signal(false);

  readonly preference = signal<ThemePreference>(this.readStoredPreference());
  readonly mode = computed<ThemeMode>(() => this.resolveMode(this.preference()));
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.watchSystemScheme();
    this.applyMode();
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    this.storePreference(preference);
    this.applyMode();
  }

  toggle(): void {
    this.setPreference(this.isDark() ? 'light' : 'dark');
  }

  private resolveMode(preference: ThemePreference): ThemeMode {
    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return preference;
  }

  private watchSystemScheme(): void {
    const query = this.document.defaultView?.matchMedia?.(DARK_SCHEME_QUERY);
    if (!query) {
      return;
    }
    this.systemPrefersDark.set(query.matches);
    query.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
      this.applyMode();
    });
  }

  private applyMode(): void {
    const mode = this.mode();
    this.document.documentElement.dataset['theme'] = mode;
    this.themeColorMeta().content = THEME_COLORS[mode];
  }

  private themeColorMeta(): HTMLMetaElement {
    const existing = this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (existing) {
      return existing;
    }
    const created = this.document.createElement('meta');
    created.name = 'theme-color';
    this.document.head.appendChild(created);
    return created;
  }

  private readStoredPreference(): ThemePreference {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
      return PREFERENCES.find((preference) => preference === stored) ?? DEFAULT_PREFERENCE;
    } catch {
      return DEFAULT_PREFERENCE;
    }
  }

  private storePreference(preference: ThemePreference): void {
    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      return;
    }
  }
}
