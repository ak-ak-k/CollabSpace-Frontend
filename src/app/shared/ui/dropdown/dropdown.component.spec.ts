import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '../icon/icon.component';
import { DROPDOWN_IMPORTS } from './dropdown-imports';

@Component({
  imports: [DROPDOWN_IMPORTS, IconComponent],
  template: `
    <button type="button" class="trigger" [cdkMenuTriggerFor]="menu">More actions</button>
    <ng-template #menu>
      <div appDropdownPanel="Conversation actions">
        <app-dropdown label="Conversation actions" width="md">
          <app-dropdown-heading>Status</app-dropdown-heading>
          <button appDropdownItem [selected]="true">Online</button>
          <button appDropdownItem [selected]="false">Away</button>
          <app-dropdown-divider />
          <button appDropdownItem tone="danger" (triggered)="deleted.set(true)">
            <app-icon name="trash-2" [size]="18" />
            Delete conversation
          </button>
        </app-dropdown>
      </div>
    </ng-template>
  `,
})
class DropdownHostComponent {
  readonly deleted = signal(false);
}

describe('DropdownComponent', () => {
  let fixture: ComponentFixture<DropdownHostComponent>;

  const trigger = () =>
    (fixture.nativeElement as HTMLElement).querySelector('.trigger') as HTMLButtonElement;
  const menu = () => document.querySelector<HTMLElement>('app-dropdown');
  const items = () => Array.from(document.querySelectorAll<HTMLElement>('[appDropdownItem]'));

  const open = async () => {
    trigger().click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(DropdownHostComponent);
    await fixture.whenStable();
  });

  it('opens a labelled menu from the trigger', async () => {
    expect(menu()).toBeNull();

    await open();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menu()?.getAttribute('role')).toBe('menu');
    expect(menu()?.getAttribute('aria-label')).toBe('Conversation actions');
    expect(menu()?.classList.contains('dropdown--md')).toBe(true);
  });

  it('wraps the menu in a labelled popup panel', async () => {
    await open();

    const panel = menu()?.parentElement;
    expect(panel?.getAttribute('role')).toBe('dialog');
    expect(panel?.getAttribute('aria-label')).toBe('Conversation actions');
    expect(panel?.hasAttribute('aria-modal')).toBe(false);
  });

  it('renders the heading, divider and items', async () => {
    await open();

    expect(document.querySelector('app-dropdown-heading')?.textContent?.trim()).toBe('Status');
    expect(document.querySelector('app-dropdown-divider')?.getAttribute('role')).toBe('separator');
    expect(items().map((item) => item.getAttribute('role'))).toEqual([
      'menuitemradio',
      'menuitemradio',
      'menuitem',
    ]);
  });

  it('runs the chosen item and closes', async () => {
    await open();

    items()[2].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.deleted()).toBe(true);
    expect(menu()).toBeNull();
  });
});
