import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SortDirection, SortHeaderComponent } from './sort-header.component';

@Component({
  imports: [SortHeaderComponent],
  template: `
    <table>
      <thead>
        <tr>
          <th appSortHeader [direction]="direction()" (sort)="sortRequests.set(sortRequests() + 1)">
            Name
          </th>
        </tr>
      </thead>
    </table>
  `,
})
class SortHeaderHostComponent {
  readonly direction = signal<SortDirection | null>(null);
  readonly sortRequests = signal(0);
}

describe('SortHeaderComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(SortHeaderHostComponent);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('th') as HTMLElement;
    return { fixture, header };
  };

  it('renders the label as a button on an unsorted column header', async () => {
    const { header } = await render();

    expect(header.getAttribute('scope')).toBe('col');
    expect(header.getAttribute('aria-sort')).toBe('none');
    expect(header.querySelector('button')?.textContent?.trim()).toBe('Name');
  });

  it('reflects the sort direction', async () => {
    const { fixture, header } = await render();

    fixture.componentInstance.direction.set('desc');
    await fixture.whenStable();

    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(header.classList.contains('sort-header--sorted')).toBe(true);
  });

  it('emits sort when the button is clicked', async () => {
    const { fixture, header } = await render();

    header.querySelector('button')?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.sortRequests()).toBe(1);
  });
});
