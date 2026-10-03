import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DisplaySectionComponent } from './display-section.component';

describe('DisplaySectionComponent', () => {
  let fixture: ComponentFixture<DisplaySectionComponent>;
  let host: HTMLElement;

  const firstFileName = () => host.querySelector('tbody th')?.textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(DisplaySectionComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows every display component', () => {
    expect(host.querySelectorAll('app-tabs').length).toBe(4);
    expect(host.querySelectorAll('app-breadcrumb').length).toBe(2);
    expect(host.querySelectorAll('app-card').length).toBe(4);
    expect(host.querySelectorAll('app-table').length).toBe(1);
    expect(host.querySelectorAll('app-pagination nav').length).toBe(1);
    expect(host.querySelectorAll('app-empty-state').length).toBe(6);
    expect(host.querySelectorAll('app-skeleton').length).toBe(6);
  });

  it('sorts the files when a sortable header is used', async () => {
    expect(firstFileName()).toBe('Q3 roadmap.pdf');

    host.querySelector<HTMLButtonElement>('th[aria-sort] button')?.click();
    await fixture.whenStable();

    expect(firstFileName()).toBe('API contract.md');
    expect(host.querySelector('th[aria-sort]')?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('pages through the files', async () => {
    host.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')?.click();
    await fixture.whenStable();

    expect(host.querySelectorAll('tbody tr').length).toBe(7);
    expect(host.querySelector('app-pagination [role="status"]')?.textContent?.trim()).toBe(
      'Showing 9–15 of 15',
    );
  });
});
