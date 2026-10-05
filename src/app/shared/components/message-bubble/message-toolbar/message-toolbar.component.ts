import { ConnectedPosition } from '@angular/cdk/overlay';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { DROPDOWN_IMPORTS } from '../../../ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconName } from '../../../ui/icon/icon-registry';
import { IconComponent } from '../../../ui/icon/icon.component';
import { MessageMenuItem, MessageMenuKind } from '../message-menu';

const TOOL_ICON_SIZE = 16;
const MENU_OFFSET = 4;

const MENU_BELOW_END: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
  offsetY: MENU_OFFSET,
};

const MENU_ABOVE_END: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'end',
  overlayY: 'bottom',
  offsetY: -MENU_OFFSET,
};

@Component({
  selector: 'app-message-toolbar',
  imports: [IconComponent, IconButtonComponent, ...DROPDOWN_IMPORTS],
  templateUrl: './message-toolbar.component.html',
  styleUrl: './message-toolbar.component.scss',
})
export class MessageToolbarComponent {
  readonly items = input<readonly MessageMenuItem[]>([]);
  readonly inThread = input(false, { transform: booleanAttribute });
  readonly pickerOpen = input(false, { transform: booleanAttribute });
  readonly saveLabel = input('Save for later');
  readonly saveIcon = input<IconName>('bookmark');

  readonly reactionRequested = output<HTMLElement>();
  readonly command = output<MessageMenuKind>();
  readonly menuOpenChange = output<boolean>();

  protected readonly iconSize = TOOL_ICON_SIZE;
  protected readonly menuPositions = [MENU_BELOW_END, MENU_ABOVE_END];

  protected requestReaction(event: MouseEvent): void {
    if (event.currentTarget instanceof HTMLElement) {
      this.reactionRequested.emit(event.currentTarget);
    }
  }
}
