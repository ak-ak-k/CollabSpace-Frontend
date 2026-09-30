import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MOCK_LATENCY } from '../../../../core/data/mock-request';
import {
  RECENT_SEARCHES_STORAGE_KEY,
  SearchService,
} from '../../../../core/services/search.service';
import { MESSAGE_SHORTCUT_LIMIT } from '../palette-commands';
import { paletteShortcutFor } from '../platform-shortcut';
import { SearchPanelComponent } from './search-panel.component';

const DIRECTORY_LOAD_MS = 20;

const directoryLoaded = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, DIRECTORY_LOAD_MS));

describe('SearchPanelComponent', () => {
  let fixture: ComponentFixture<SearchPanelComponent>;
  let host: HTMLElement;
  let search: SearchService;

  const options = (): HTMLElement[] => Array.from(host.querySelectorAll('[role="option"]'));
  const pressedChip = (): string | undefined =>
    host.querySelector('button[aria-pressed="true"]')?.textContent?.trim();

  beforeEach(() => {
    localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MOCK_LATENCY, useValue: { minimum: 0, maximum: 0 } },
      ],
    });
    search = TestBed.inject(SearchService);
  });

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(SearchPanelComponent);
    host = fixture.nativeElement as HTMLElement;
    await directoryLoaded();
    await fixture.whenStable();
  };

  it('offers recent searches and the jump commands while idle', async () => {
    search.open();
    await create();

    const labels = options().map((option) => option.textContent?.trim());

    expect(pressedChip()).toBe('All');
    expect(labels.slice(0, 4)).toEqual(['release checklist', 'NS-142', 'Priya', 'api-v2-spec']);
    expect(labels).toContain('Go to Dashboard');
    expect(labels).toContain('Open settings');
  });

  it('starts from the requested filter and offers message shortcuts for people', async () => {
    search.open('people');
    await create();

    expect(pressedChip()).toBe('People');
    expect(options().length).toBe(MESSAGE_SHORTCUT_LIMIT);
    expect(options()[0].textContent).toContain('Message Rahul Mehta');
    expect(options()[0].textContent).toContain('Online');
    expect(host.textContent).not.toContain('Recent searches');
  });

  it('closes when the scrim is clicked', async () => {
    search.open();
    await create();

    host.querySelector<HTMLElement>('.panel__scrim')?.click();

    expect(search.isOpen()).toBe(false);
  });

  it('names the shortcut for the platform', () => {
    expect(paletteShortcutFor('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('⌘K');
    expect(paletteShortcutFor('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Ctrl K');
    expect(paletteShortcutFor('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Ctrl K');
  });
});
