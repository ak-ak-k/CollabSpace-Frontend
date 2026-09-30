import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let host: HTMLElement;

  const render = async (inputs: Record<string, unknown>) => {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
  };

  const button = (label: string) =>
    host.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('summarises the visible range and disables Previous on the first page', async () => {
    await render({ total: 15 });

    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('1–8 of 15');
    expect(button('Previous page').disabled).toBe(true);
    expect(button('Next page').disabled).toBe(false);
  });

  it('moves to the next page and disables Next on the last page', async () => {
    await render({ total: 15 });

    button('Next page').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.page()).toBe(2);
    expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('9–15 of 15');
    expect(button('Next page').disabled).toBe(true);
  });

  it('clamps the page when the total shrinks', async () => {
    await render({ total: 40, page: 5 });
    await render({ total: 12 });

    expect(fixture.componentInstance.page()).toBe(2);
  });

  it('renders nothing when everything fits on one page', async () => {
    await render({ total: 8 });

    expect(host.querySelector('nav')).toBeNull();
  });
});
