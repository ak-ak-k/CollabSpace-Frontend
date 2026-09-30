import { booleanAttribute, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConversationPreview } from '../../../core/models/conversation';
import { formatWhen } from '../../pipes/time-format';
import { AvatarComponent, AvatarSize } from '../../ui/avatar/avatar.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { IconComponent } from '../../ui/icon/icon.component';

export type ConversationItemDensity = 'compact' | 'comfortable';

const AVATAR_SIZES: Record<ConversationItemDensity, AvatarSize> = { compact: 40, comfortable: 44 };

@Component({
  selector: 'app-conversation-item',
  imports: [RouterLink, AvatarComponent, BadgeComponent, IconComponent],
  templateUrl: './conversation-item.component.html',
  styleUrl: './conversation-item.component.scss',
  host: {
    '[class.conversation-item--comfortable]': "density() === 'comfortable'",
    '[class.conversation-item--selected]': 'selected()',
    '[class.conversation-item--unread]': 'hasUnread()',
  },
})
export class ConversationItemComponent {
  readonly conversation = input.required<ConversationPreview>();
  readonly density = input<ConversationItemDensity>('compact');
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly avatarSize = computed(() => AVATAR_SIZES[this.density()]);
  protected readonly isDirect = computed(() => this.conversation().type === 'dm');
  protected readonly isComfortable = computed(() => this.density() === 'comfortable');
  protected readonly hasUnread = computed(() => this.conversation().unreadCount > 0);
  protected readonly isTyping = computed(() => this.conversation().typingText !== '');
  protected readonly line = computed(
    () => this.conversation().typingText || this.conversation().preview,
  );
  protected readonly when = computed(() => {
    const lastMessageAt = this.conversation().lastMessageAt;
    return lastMessageAt ? formatWhen(lastMessageAt) : '';
  });
  protected readonly accessibleLabel = computed(() => this.describe(this.conversation()));

  private describe(conversation: ConversationPreview): string {
    const unread = this.hasUnread() ? `, ${conversation.unreadCount} unread` : '';
    const activity = this.isTyping()
      ? `, ${conversation.typingText}`
      : `, last message: ${conversation.preview}`;
    const when = this.when() ? `, ${this.when()}` : '';
    return conversation.title + unread + activity + when;
  }
}
