import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFiltersComponent } from './search-filters.component';

describe('SearchFiltersComponent', () => {
  let fixture: ComponentFixture<SearchFiltersComponent>;
  let host: HTMLElement;

  const chips = (): HTMLButtonElement[] => Array.from(host.querySelectorAll('button'));
  const labels = (): (string | undefined)[] =>
    chips().map((chip) => chip.querySelector('span')?.textContent?.trim());

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFiltersComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('selected', 'all');
  });

  it('renders the seven filters as a labelled group of toggle buttons', async () => {
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Filter results');
    expect(labels()).toEqual(['All', 'People', 'Messages', 'Channels', 'Teams', 'Tasks', 'Files']);
    expect(chips()[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips()[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the counts it is given', async () => {
    fixture.componentRef.setInput('counts', { people: 3 });
    await fixture.whenStable();

    expect(chips()[1].querySelector('.chip__count')?.textContent).toBe('3');
    expect(chips()[2].querySelector('.chip__count')).toBeNull();
  });

  it('reports the filter that was picked', async () => {
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();

    chips()[5].click();

    expect(picked).toHaveBeenCalledWith('tasks');
  });
});
