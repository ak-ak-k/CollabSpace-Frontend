import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { MessageView, QUICK_EMOJI } from '../../../../core/models/thread';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { IconName } from '../../../../shared/ui/icon/icon-registry';

export interface MessageActionsSheetData {
  readonly message: MessageView;
}

export type SheetActionKind = 'reply' | 'copy' | 'pin' | 'edit' | 'delete';

export type MessageActionsSheetResult =
  { readonly kind: SheetActionKind } | { readonly kind: 'react'; readonly emoji: string };

interface SheetAction {
  readonly kind: SheetActionKind;
  readonly label: string;
  readonly icon: IconName;
  readonly destructive: boolean;
}

@Component({
  selector: 'app-message-actions-sheet',
  imports: [IconComponent],
  templateUrl: './message-actions-sheet.component.html',
  styleUrl: './message-actions-sheet.component.scss',
})
export class MessageActionsSheetComponent {
  private readonly dialogRef = inject<DialogRef<MessageActionsSheetResult>>(DialogRef);
  private readonly message = inject<MessageActionsSheetData>(DIALOG_DATA).message;

  protected readonly emoji = QUICK_EMOJI;
  protected readonly actions = computed<readonly SheetAction[]>(() => {
    const pinned = this.message.pinned;
    const candidates: readonly (SheetAction | false)[] = [
      { kind: 'reply', label: 'Reply', icon: 'reply', destructive: false },
      this.message.text !== '' && {
        kind: 'copy',
        label: 'Copy text',
        icon: 'copy',
        destructive: false,
      },
      {
        kind: 'pin',
        label: pinned ? 'Unpin' : 'Pin message',
        icon: pinned ? 'pin-off' : 'pin',
        destructive: false,
      },
      this.message.mine && {
        kind: 'edit',
        label: 'Edit message',
        icon: 'pencil',
        destructive: false,
      },
      this.message.mine && {
        kind: 'delete',
        label: 'Delete message',
        icon: 'trash-2',
        destructive: true,
      },
    ];
    return candidates.filter((action): action is SheetAction => action !== false);
  });

  protected react(emoji: string): void {
    this.dialogRef.close({ kind: 'react', emoji });
  }

  protected run(kind: SheetActionKind): void {
    this.dialogRef.close({ kind });
  }
}
