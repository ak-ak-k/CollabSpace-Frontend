import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MOCK_LATENCY } from '../../../core/data/mock-request';
import { RECENT_SEARCHES_STORAGE_KEY, SearchService } from '../../../core/services/search.service';
import { SearchPaletteComponent } from './search-palette.component';
import { SEARCH_DEBOUNCE_MS } from './search-session';

const SETTLE_MARGIN_MS = 80;

const settle = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + SETTLE_MARGIN_MS));

describe('SearchPaletteComponent', () => {
  let fixture: ComponentFixture<SearchPaletteComponent>;
  let host: HTMLElement;
  let search: SearchService;

  const dialog = (): HTMLElement | null => host.querySelector('[role="dialog"]');
  const field = (): HTMLInputElement => host.querySelector('input') as HTMLInputElement;
  const options = (): HTMLElement[] => Array.from(host.querySelectorAll('[role="option"]'));
  const activeId = (): string | null => field().getAttribute('aria-activedescendant');

  const press = async (key: string): Promise<void> => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };

  const type = async (text: string): Promise<void> => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    await settle();
    await fixture.whenStable();
  };

  beforeEach(() => {
    localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MOCK_LATENCY, useValue: { minimum: 0, maximum: 0 } },
      ],
    });
    fixture = TestBed.createComponent(SearchPaletteComponent);
    host = fixture.nativeElement as HTMLElement;
    search = TestBed.inject(SearchService);
  });

  it('renders nothing while closed', async () => {
    await fixture.whenStable();

    expect(host.childElementCount).toBe(0);
  });

  it('renders a modal dialog with a focused combobox when opened', async () => {
    search.open();
    await fixture.whenStable();

    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(dialog()?.getAttribute('aria-label')).toBe('Search CollabSpace');
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().getAttribute('aria-controls')).toBe(host.querySelector('[role="listbox"]')?.id);
    expect(document.activeElement).toBe(field());
  });

  it('moves the active option with the arrow, Home and End keys without wrapping', async () => {
    search.open();
    await fixture.whenStable();
    const ids = options().map((option) => option.id);

    expect(activeId()).toBe(ids[0]);

    await press('ArrowUp');
    expect(activeId()).toBe(ids[0]);

    await press('ArrowDown');
    expect(activeId()).toBe(ids[1]);
    expect(options()[1].getAttribute('aria-selected')).toBe('true');

    await press('End');
    expect(activeId()).toBe(ids[ids.length - 1]);

    await press('ArrowDown');
    expect(activeId()).toBe(ids[ids.length - 1]);

    await press('Home');
    expect(activeId()).toBe(ids[0]);
  });

  it('closes on Escape and returns focus to the opener', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    search.open();
    await fixture.whenStable();

    await press('Escape');

    expect(search.isOpen()).toBe(false);
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('lists grouped results and opens the active one with Enter', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    search.open();
    await fixture.whenStable();

    await type('priya');
    const groups = Array.from(host.querySelectorAll('[role="listbox"] [role="group"]'));
    const headings = groups.map((group) =>
      host.querySelector(`#${group.getAttribute('aria-labelledby')}`)?.textContent?.trim(),
    );

    expect(headings[0]).toBe('People · 1');
    expect(options()[0].querySelector('mark')?.textContent).toBe('Priya');

    await press('Enter');

    expect(navigate).toHaveBeenCalledWith(['/profile/u2'], { queryParams: undefined });
    expect(search.recentSearches()[0]).toBe('priya');
    expect(search.isOpen()).toBe(false);
  });

  it('drops a pending search when the query is cleared', async () => {
    search.open();
    await fixture.whenStable();

    field().value = 'priya';
    field().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]')?.click();
    await settle();
    await fixture.whenStable();

    expect(field().value).toBe('');
    expect(host.querySelector('app-spinner')).toBeNull();
    expect(options()[0].textContent).toContain('release checklist');
  });
});
