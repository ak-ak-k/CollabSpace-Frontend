import { CdkMenuItem } from '@angular/cdk/menu';
import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

export type DropdownItemTone = 'default' | 'danger';
export type DropdownItemSelection = 'radio' | 'checkbox';

const SELECTION_ROLES: Record<DropdownItemSelection, string> = {
  radio: 'menuitemradio',
  checkbox: 'menuitemcheckbox',
};
const PLAIN_ROLE = 'menuitem';

@Component({
  selector: 'button[appDropdownItem], a[appDropdownItem]',
  imports: [IconComponent],
  templateUrl: './dropdown-item.component.html',
  styleUrl: './dropdown-item.component.scss',
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  host: {
    '[class.dropdown-item--danger]': 'tone() === "danger"',
    '[attr.role]': 'role()',
    '[attr.aria-checked]': 'selected() ?? null',
  },
})
export class DropdownItemComponent {
  readonly tone = input<DropdownItemTone>('default');
  readonly selected = input<boolean | undefined>(undefined);
  readonly selection = input<DropdownItemSelection>('radio');

  protected readonly role = computed(() =>
    this.selected() === undefined ? PLAIN_ROLE : SELECTION_ROLES[this.selection()],
  );
  protected readonly showsSwitch = computed(
    () => this.selected() !== undefined && this.selection() === 'checkbox',
  );
}
