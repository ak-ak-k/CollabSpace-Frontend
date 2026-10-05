import { ConnectedPosition } from '@angular/cdk/overlay';
import { CountPipe, formatCount } from '../../../../shared/pipes/count.pipe';
import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarGroupComponent } from '../../../../shared/ui/avatar-group/avatar-group.component';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { DROPDOWN_IMPORTS } from '../../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ConversationView } from '../conversation-view';

const MENU_OFFSET = 6;

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
  selector: 'app-conversation-header',
  imports: [
    CountPipe,
    RouterLink,
    AvatarComponent,
    AvatarGroupComponent,
    IconButtonComponent,
    IconComponent,
    DROPDOWN_IMPORTS,
  ],
  templateUrl: './conversation-header.component.html',
  styleUrl: './conversation-header.component.scss',
  host: { '[class.header--compact]': 'compact()' },
})
export class ConversationHeaderComponent {
  readonly view = input.required<ConversationView>();
  readonly typingText = input('');
  readonly starred = input(false, { transform: booleanAttribute });
  readonly muted = input(false, { transform: booleanAttribute });
  readonly searchOpen = input(false, { transform: booleanAttribute });
  readonly detailsOpen = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly backLink = input<string | null>(null);
  readonly pinnedCount = input(0);

  readonly searchToggled = output<void>();
  readonly starToggled = output<void>();
  readonly detailsToggled = output<void>();
  readonly muteToggled = output<void>();
  readonly markedUnread = output<void>();
  readonly linkCopied = output<void>();
  readonly pinnedRequested = output<void>();
  readonly left = output<void>();

  protected readonly menuPositions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly isChannel = computed(() => this.view().type === 'channel');
  protected readonly subtitle = computed(() => this.typingText() || this.view().subtitle);
  protected readonly starLabel = computed(() =>
    this.starred() ? 'Remove from favourites' : 'Add to favourites',
  );
  protected readonly showPinChip = computed(
    () => this.view().type !== 'dm' && this.pinnedCount() > 0 && !this.compact(),
  );
  protected readonly pinChipLabel = computed(() => {
    const count = this.pinnedCount();
    return `View ${count} pinned ${count === 1 ? 'message' : 'messages'}`;
  });
  protected readonly membersLabel = computed(
    () => `View ${formatCount(this.view().memberCount, 'member')}`,
  );
  protected readonly leaveLabel = computed(() =>
    this.isChannel() ? 'Leave channel' : 'Leave group',
  );
}
