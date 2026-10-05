import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { ConversationPreview } from '../../../core/models/conversation';
import { DialogService } from '../../../core/services/dialog.service';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { InboxActions } from '../inbox-actions.service';
import { MembershipActions } from '../membership-actions.service';
import {
  ConversationSheetComponent,
  ConversationSheetData,
} from './conversation-sheet/conversation-sheet.component';

export type RowActionKind = 'read' | 'unread' | 'favourite' | 'mute' | 'leave';

export interface RowMenuItem {
  readonly kind: RowActionKind;
  readonly icon: IconName;
  readonly label: string;
}

const readItem = (preview: ConversationPreview): RowMenuItem =>
  preview.unreadCount > 0
    ? { kind: 'read', icon: 'check-check', label: 'Mark as read' }
    : { kind: 'unread', icon: 'circle-dot', label: 'Mark as unread' };

const favouriteItem = (preview: ConversationPreview): RowMenuItem => ({
  kind: 'favourite',
  icon: 'star',
  label: preview.starred ? 'Remove from favourites' : 'Add to favourites',
});

const muteItem = (preview: ConversationPreview): RowMenuItem => ({
  kind: 'mute',
  icon: preview.muted ? 'bell' : 'bell-off',
  label: preview.muted ? 'Unmute' : 'Mute',
});

const LEAVE_ITEM: RowMenuItem = { kind: 'leave', icon: 'log-out', label: 'Leave group' };

@Service()
export class ConversationRowActions {
  private readonly inbox = inject(InboxActions);
  private readonly membership = inject(MembershipActions);
  private readonly dialogs = inject(DialogService);

  menuItems(preview: ConversationPreview): readonly RowMenuItem[] {
    const items = [readItem(preview), favouriteItem(preview), muteItem(preview)];
    return preview.type === 'group' ? [...items, LEAVE_ITEM] : items;
  }

  run(kind: RowActionKind, preview: ConversationPreview): void {
    switch (kind) {
      case 'read':
        return this.inbox.markRead(preview.id);
      case 'unread':
        return this.inbox.markUnread(preview.id);
      case 'favourite':
        return this.inbox.toggleFavourite(preview.id);
      case 'mute':
        return this.inbox.toggleMute(preview.id);
      case 'leave':
        return void this.membership.leaveGroup(preview.id);
    }
  }

  openSheet(preview: ConversationPreview): DialogRef<RowActionKind> {
    const dialogRef = this.dialogs.openDrawer<RowActionKind, ConversationSheetData>(
      ConversationSheetComponent,
      {
        data: { title: preview.title, items: this.menuItems(preview) },
        side: 'bottom',
        ariaLabel: `Actions for ${preview.title}`,
      },
    );
    dialogRef.closed.subscribe((kind) => {
      if (kind) {
        this.run(kind, preview);
      }
    });
    return dialogRef;
  }
}
