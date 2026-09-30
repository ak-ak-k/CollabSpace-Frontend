import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_RECENT_SEARCHES,
  RECENT_SEARCH_LIMIT,
  RECENT_SEARCHES_STORAGE_KEY,
  SearchService,
} from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    service = TestBed.inject(SearchService);
  });

  it('opens with the requested filter', () => {
    service.open('people');

    expect(service.isOpen()).toBe(true);
    expect(service.filter()).toBe('people');
  });

  it('falls back to every category when opened without a filter', () => {
    service.open('tasks');
    service.close();
    service.open();

    expect(service.filter()).toBe('all');
  });

  it('toggles between open and closed', () => {
    service.toggle();
    expect(service.isOpen()).toBe(true);

    service.toggle();
    expect(service.isOpen()).toBe(false);
  });

  it('starts with the seeded recent searches', () => {
    expect(service.recentSearches()).toEqual(DEFAULT_RECENT_SEARCHES);
  });

  it('moves a repeated search to the front and stores the list', () => {
    service.addRecent('  priya ');

    expect(service.recentSearches()).toEqual([
      'priya',
      'release checklist',
      'NS-142',
      'api-v2-spec',
    ]);
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe(
      JSON.stringify(service.recentSearches()),
    );
  });

  it('keeps only the latest searches', () => {
    ['one', 'two', 'three', 'four'].forEach((query) => service.addRecent(query));

    expect(service.recentSearches().length).toBe(RECENT_SEARCH_LIMIT);
    expect(service.recentSearches()[0]).toBe('four');
  });

  it('removes a recent search', () => {
    service.removeRecent('NS-142');

    expect(service.recentSearches()).not.toContain('NS-142');
  });
});
