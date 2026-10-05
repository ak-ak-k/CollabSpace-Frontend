import { BreakpointObserver } from '@angular/cdk/layout';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { ConversationPreview } from '../../../../core/models/conversation';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { ConversationItemComponent } from '../../../../shared/components/conversation-item/conversation-item.component';
import { DROPDOWN_IMPORTS } from '../../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ConversationRowActions, RowMenuItem } from '../conversation-row-actions.service';

const COARSE_POINTER = '(pointer: coarse)';

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
  selector: 'app-conversation-row',
  imports: [ConversationItemComponent, DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './conversation-row.component.html',
  styleUrl: './conversation-row.component.scss',
  host: { '(contextmenu)': 'openSheet($event)' },
})
export class ConversationRowComponent {
  private readonly actions = inject(ConversationRowActions);
  private readonly breakpoint = inject(BreakpointService);
  private readonly observer = inject(BreakpointObserver);

  readonly conversation = input.required<ConversationPreview>();
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly items = computed(() => this.actions.menuItems(this.conversation()));
  protected readonly triggerLabel = computed(() => `More actions for ${this.conversation().title}`);
  protected readonly menuLabel = computed(() => `Actions for ${this.conversation().title}`);

  protected run(item: RowMenuItem): void {
    this.actions.run(item.kind, this.conversation());
  }

  protected openSheet(event: Event): void {
    if (!this.breakpoint.isMobile() && !this.observer.isMatched(COARSE_POINTER)) {
      return;
    }
    event.preventDefault();
    this.actions.openSheet(this.conversation());
  }
}
