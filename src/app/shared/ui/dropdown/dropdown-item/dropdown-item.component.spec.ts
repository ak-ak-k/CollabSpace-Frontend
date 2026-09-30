import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconComponent } from '../../icon/icon.component';
import { DropdownComponent } from '../dropdown.component';
import { DropdownItemComponent, DropdownItemSelection } from './dropdown-item.component';

@Component({
  imports: [DropdownComponent, DropdownItemComponent, IconComponent],
  template: `
    <app-dropdown label="Appearance">
      <button appDropdownItem [selected]="selected()" [selection]="selection()" [tone]="tone()">
        <app-icon name="moon" [size]="18" />
        Dark mode
      </button>
    </app-dropdown>
  `,
})
class DropdownItemHostComponent {
  readonly selected = signal<boolean | undefined>(undefined);
  readonly selection = signal<DropdownItemSelection>('radio');
  readonly tone = signal<'default' | 'danger'>('default');
}

describe('DropdownItemComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(DropdownItemHostComponent);
    await fixture.whenStable();
    const item = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLElement;
    return { fixture, item };
  };

  it('renders a plain menu item with its icon and label', async () => {
    const { item } = await render();

    expect(item.getAttribute('role')).toBe('menuitem');
    expect(item.getAttribute('aria-checked')).toBeNull();
    expect(item.querySelector('.dropdown-item__label')?.textContent?.trim()).toBe('Dark mode');
    expect(item.querySelectorAll('app-icon').length).toBe(1);
  });

  it('shows a check mark for a selected choice', async () => {
    const { fixture, item } = await render();

    fixture.componentInstance.selected.set(true);
    await fixture.whenStable();

    expect(item.getAttribute('role')).toBe('menuitemradio');
    expect(item.getAttribute('aria-checked')).toBe('true');
    expect(item.querySelectorAll('app-icon').length).toBe(2);
  });

  it('shows a switch for an option that turns on and off', async () => {
    const { fixture, item } = await render();

    fixture.componentInstance.selected.set(true);
    fixture.componentInstance.selection.set('checkbox');
    await fixture.whenStable();

    expect(item.getAttribute('role')).toBe('menuitemcheckbox');
    expect(item.getAttribute('aria-checked')).toBe('true');
    expect(item.querySelector('.dropdown-item__switch--on')).not.toBeNull();
    expect(item.querySelectorAll('app-icon').length).toBe(1);
  });

  it('marks an unselected choice and the danger tone', async () => {
    const { fixture, item } = await render();

    fixture.componentInstance.selected.set(false);
    fixture.componentInstance.tone.set('danger');
    await fixture.whenStable();

    expect(item.getAttribute('role')).toBe('menuitemradio');
    expect(item.getAttribute('aria-checked')).toBe('false');
    expect(item.classList.contains('dropdown-item--danger')).toBe(true);
  });
});
