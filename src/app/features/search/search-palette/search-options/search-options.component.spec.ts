import { ComponentFixture, TestBed } from '@angular/core/testing';
import { highlight, SearchGroup } from '../../../../core/data/search.data';
import { jumpCommands } from '../palette-commands';
import { idleDrafts, layOutSections, resultDrafts } from '../palette-options';
import { SearchOptionsComponent } from './search-options.component';

const PEOPLE: SearchGroup = {
  key: 'people',
  label: 'People',
  icon: 'user',
  total: 6,
  hasMore: true,
  items: [
    {
      kind: 'person',
      id: 'u2',
      name: 'Priya Sharma',
      colorSeed: 2,
      status: 'away',
      title: highlight('Priya Sharma', 'pri'),
      subtitle: 'Product Designer · Away',
      target: { path: '/messages/dm-u2' },
    },
    {
      kind: 'person',
      id: 'u1',
      name: 'Rahul Mehta',
      colorSeed: 1,
      status: 'online',
      title: highlight('Rahul Mehta', 'pri'),
      subtitle: 'Senior Frontend Engineer · Online',
      target: { path: '/messages/dm-u1' },
    },
  ],
};

describe('SearchOptionsComponent', () => {
  let fixture: ComponentFixture<SearchOptionsComponent>;
  let host: HTMLElement;

  const listbox = (): HTMLElement => host.querySelector('[role="listbox"]') as HTMLElement;
  const options = (): HTMLElement[] => Array.from(host.querySelectorAll('[role="option"]'));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOptionsComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('groups the options under labelled headings and keeps buttons out of the listbox', async () => {
    const sections = layOutSections(idleDrafts(['NS-142', 'Priya'], jumpCommands(false)));
    fixture.componentRef.setInput('sections', sections);
    await fixture.whenStable();

    const groups = Array.from(listbox().querySelectorAll('[role="group"]'));
    const headings = groups.map(
      (group) => host.querySelector(`#${group.getAttribute('aria-labelledby')}`)?.textContent,
    );

    expect(headings.map((heading) => heading?.trim())).toEqual(['Recent searches', 'Jump to']);
    expect(options().length).toBe(10);
    expect(listbox().querySelector('button')).toBeNull();
    expect(host.querySelectorAll('button').length).toBe(2);
  });

  it('marks the active option and never renders an empty highlight', async () => {
    fixture.componentRef.setInput('sections', layOutSections(resultDrafts([PEOPLE])));
    fixture.componentRef.setInput('activeIndex', 1);
    await fixture.whenStable();

    expect(options().map((option) => option.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ]);
    expect(options()[0].querySelector('mark')?.textContent).toBe('Pri');
    expect(options()[1].querySelector('mark')).toBeNull();
  });

  it('reports activation, removal and expansion', async () => {
    const activated = vi.fn();
    const removed = vi.fn();
    const expanded = vi.fn();
    fixture.componentInstance.activated.subscribe(activated);
    fixture.componentInstance.removed.subscribe(removed);
    fixture.componentInstance.expanded.subscribe(expanded);

    fixture.componentRef.setInput('sections', layOutSections(idleDrafts(['NS-142'], [])));
    await fixture.whenStable();
    options()[0].click();
    host.querySelector<HTMLButtonElement>('button')?.click();

    fixture.componentRef.setInput('sections', layOutSections(resultDrafts([PEOPLE])));
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('button')?.click();

    expect(activated).toHaveBeenCalledWith(expect.objectContaining({ query: 'NS-142', index: 0 }));
    expect(removed).toHaveBeenCalledWith('NS-142');
    expect(expanded).toHaveBeenCalledWith('people');
  });
});
