import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, input, signal } from '@angular/core';
import { DROPDOWN_IMPORTS } from '../../../shared/ui/dropdown/dropdown-imports';
import {
  IconButtonComponent,
  IconButtonSize,
} from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { PeopleActions, PersonMenuItem } from '../people-actions.service';
import { PersonRow } from '../people-page-view';

export type PersonMenuVariant = 'popover' | 'sheet';

const MENU_BELOW_END: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
};
const MENU_ABOVE_END: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'end',
  overlayY: 'bottom',
};

@Component({
  selector: 'app-person-menu',
  imports: [DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './person-menu.component.html',
  styleUrl: './person-menu.component.scss',
})
export class PersonMenuComponent {
  private readonly actions = inject(PeopleActions);

  readonly person = input.required<PersonRow>();
  readonly variant = input<PersonMenuVariant>('popover');
  readonly icon = input<IconName>('ellipsis');
  readonly size = input<IconButtonSize>('md');

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly label = computed(() => `More actions for ${this.person().name}`);
  protected readonly menuLabel = computed(() => `Actions for ${this.person().name}`);
  protected readonly items = computed(() => this.actions.menuItems(this.person()));
  protected readonly sheetOpen = signal(false);

  protected run(item: PersonMenuItem): void {
    this.actions.run(item, this.person());
  }

  protected openSheet(): void {
    this.sheetOpen.set(true);
    this.actions.openSheet(this.person()).closed.subscribe(() => this.sheetOpen.set(false));
  }
}
