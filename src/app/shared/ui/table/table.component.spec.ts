import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';

@Component({
  imports: [TableComponent],
  template: `
    <app-table label="Workspace members" minWidth="md">
      <table>
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Priya Sharma</td>
            <td>Admin</td>
          </tr>
        </tbody>
      </table>
    </app-table>
  `,
})
class TableHostComponent {}

describe('TableComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(TableHostComponent);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('app-table') as HTMLElement;
  };

  it('wraps the table in a labelled focusable region', async () => {
    const table = await render();
    const region = table.querySelector('[role="region"]');

    expect(region?.getAttribute('aria-label')).toBe('Workspace members');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.querySelectorAll('tbody td').length).toBe(2);
  });

  it('reflects the minimum width', async () => {
    const table = await render();

    expect(table.classList.contains('table--min-md')).toBe(true);
  });

  it('hides both edge hints when nothing is scrolled out of view', async () => {
    const table = await render();

    expect(table.querySelectorAll('.fade').length).toBe(2);
    expect(table.querySelectorAll('.fade--visible').length).toBe(0);
  });
});
