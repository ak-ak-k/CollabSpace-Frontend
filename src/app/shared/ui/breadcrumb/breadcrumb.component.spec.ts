import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';

const TEAM_TRAIL: readonly BreadcrumbItem[] = [
  { label: 'Teams', link: '/teams' },
  { label: 'Design', link: ['/teams', 'design'] },
  { label: 'Members' },
];

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let host: HTMLElement;

  const render = async (items: readonly BreadcrumbItem[]) => {
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(BreadcrumbComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders a labelled trail with the last item as the current page', async () => {
    await render(TEAM_TRAIL);

    const links = Array.from(host.querySelectorAll('ol a'));

    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/teams', '/teams/design']);
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Members');
    expect(host.querySelectorAll('ol .breadcrumb__separator').length).toBe(2);
  });

  it('offers a back link to the previous item for small screens', async () => {
    await render(TEAM_TRAIL);

    const back = host.querySelector('.breadcrumb__back');

    expect(back?.textContent?.trim()).toBe('Design');
    expect(back?.getAttribute('href')).toBe('/teams/design');
    expect(host.classList.contains('breadcrumb--collapsible')).toBe(true);
  });

  it('keeps the trail when there is no previous link', async () => {
    await render([{ label: 'Settings' }]);

    expect(host.querySelector('.breadcrumb__back')).toBeNull();
    expect(host.classList.contains('breadcrumb--collapsible')).toBe(false);
  });
});
