import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TabItem, TabsComponent } from './tabs.component';

const FILTER_TABS: readonly TabItem[] = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'unread', label: 'Unread', count: 0 },
  { id: 'groups', label: 'Groups' },
];

const SECTION_TABS: readonly TabItem[] = [
  { id: 'overview', label: 'Overview', link: '/teams/design/overview' },
  { id: 'members', label: 'Members', link: '/teams/design/members' },
];

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsComponent>;
  let host: HTMLElement;

  const render = async (tabs: readonly TabItem[], active: string) => {
    fixture.componentRef.setInput('label', 'Filter conversations');
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('active', active);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TabsComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders a labelled tablist with the active tab selected', async () => {
    await render(FILTER_TABS, 'unread');

    const tabs = Array.from(host.querySelectorAll('[role="tab"]'));

    expect(host.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
      'Filter conversations',
    );
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('shows a count only when it is greater than zero', async () => {
    await render(FILTER_TABS, 'all');

    const counts = Array.from(host.querySelectorAll('.tab__count'));

    expect(counts.map((count) => count.textContent?.trim())).toEqual(['12']);
  });

  it('moves and activates with the keyboard', async () => {
    await render(FILTER_TABS, 'all');
    const tablist = host.querySelector('[role="tablist"]') as HTMLElement;

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('groups');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('all');
  });

  it('renders navigation links when every tab has a link', async () => {
    await render(SECTION_TABS, 'members');

    const links = Array.from(host.querySelectorAll('nav a'));

    expect(host.querySelector('[role="tablist"]')).toBeNull();
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/teams/design/overview',
      '/teams/design/members',
    ]);
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual([null, 'page']);
  });
});
