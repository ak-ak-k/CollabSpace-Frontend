import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThreadPreview } from '../../../core/models/thread';
import { replyCountLabel } from '../../../core/state/chat-thread-view';
import { formatRelative } from '../../pipes/time-format';
import { AvatarGroupComponent } from '../../ui/avatar-group/avatar-group.component';

@Component({
  selector: 'app-thread-row',
  imports: [RouterLink, AvatarGroupComponent],
  templateUrl: './thread-row.component.html',
  styleUrl: './thread-row.component.scss',
})
export class ThreadRowComponent {
  readonly thread = input.required<ThreadPreview>();
  readonly link = input.required<string>();

  protected readonly replies = computed(() => replyCountLabel(this.thread().replyCount));
  protected readonly lastReply = computed(
    () => `Last reply ${formatRelative(this.thread().lastReplyAt).toLowerCase()}`,
  );
  protected readonly unread = computed(() => this.thread().unreadCount);
  protected readonly accessibleLabel = computed(() => {
    const unread = this.unread() > 0 ? `, ${this.unread()} new` : '';
    return `Open thread, ${this.replies()}${unread}`;
  });
}
