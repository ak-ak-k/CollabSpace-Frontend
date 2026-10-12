import { DOCUMENT, effect, inject, Service, signal, untracked } from '@angular/core';
import { AuthState } from '../state/auth.state';

export type SearchFilter = 'all' | 'people' | 'messages' | 'channels' | 'teams' | 'tasks' | 'files';

export const RECENT_SEARCHES_STORAGE_KEY = 'collabspace.recent-searches';
export const RECENT_SEARCH_LIMIT = 6;
export const DEFAULT_RECENT_SEARCHES: readonly string[] = [
  'release checklist',
  'NS-142',
  'Priya',
  'api-v2-spec',
];

const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

@Service()
export class SearchService {
  private readonly document = inject(DOCUMENT);
  private readonly storedRecentSearches = signal<readonly string[]>(this.readRecentSearches());

  readonly isOpen = signal(false);
  readonly filter = signal<SearchFilter>('all');
  readonly recentSearches = this.storedRecentSearches.asReadonly();

  constructor() {
    const auth = inject(AuthState);
    effect(() => {
      if (!auth.authenticated()) {
        untracked(() => this.forgetSession());
      }
    });
  }

  open(filter: SearchFilter = 'all'): void {
    this.filter.set(filter);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  addRecent(query: string): void {
    const text = query.trim();
    if (!text) {
      return;
    }
    const others = this.recentSearches().filter(
      (recent) => recent.toLowerCase() !== text.toLowerCase(),
    );
    this.saveRecentSearches([text, ...others].slice(0, RECENT_SEARCH_LIMIT));
  }

  removeRecent(query: string): void {
    this.saveRecentSearches(this.recentSearches().filter((recent) => recent !== query));
  }

  clearRecent(): void {
    this.saveRecentSearches([]);
  }

  private forgetSession(): void {
    this.close();
    this.clearRecent();
  }

  private saveRecentSearches(searches: readonly string[]): void {
    this.storedRecentSearches.set(searches);
    try {
      this.document.defaultView?.localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(searches),
      );
    } catch {
      return;
    }
  }

  private readRecentSearches(): readonly string[] {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      return isTextList(parsed) ? parsed.slice(0, RECENT_SEARCH_LIMIT) : DEFAULT_RECENT_SEARCHES;
    } catch {
      return DEFAULT_RECENT_SEARCHES;
    }
  }
}
