import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, input, signal } from '@angular/core';
import { DROPDOWN_IMPORTS } from '../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { MemberActions } from '../member-actions.service';
import { MemberActionKind } from '../member-actions-view';
import { MemberRow } from '../members-view';

export type MemberMenuVariant = 'popover' | 'sheet';

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
  selector: 'app-member-menu',
  imports: [DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './member-menu.component.html',
  styleUrl: './member-menu.component.scss',
})
export class MemberMenuComponent {
  private readonly actions = inject(MemberActions);

  readonly member = input.required<MemberRow>();
  readonly variant = input<MemberMenuVariant>('popover');

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly label = computed(() => `Actions for ${this.member().name}`);
  protected readonly items = computed(() => this.actions.menuItems(this.member()));
  protected readonly sheetOpen = signal(false);

  protected run(kind: MemberActionKind): void {
    this.actions.run(kind, this.member().id);
  }

  protected openSheet(): void {
    this.sheetOpen.set(true);
    this.actions.openSheet(this.member()).closed.subscribe(() => this.sheetOpen.set(false));
  }
}
