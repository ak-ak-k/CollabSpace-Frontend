import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { reactionLabel } from '../../../../core/models/emoji-names';
import { QUICK_EMOJI } from '../../../../core/models/thread';
import {
  MessageMenuItem,
  MessageMenuKind,
} from '../../../../shared/components/message-bubble/message-menu';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export interface MessageActionsSheetData {
  readonly items: readonly MessageMenuItem[];
}

export type MessageActionsSheetResult =
  { readonly kind: MessageMenuKind } | { readonly kind: 'react'; readonly emoji: string };

@Component({
  selector: 'app-message-actions-sheet',
  imports: [IconComponent],
  templateUrl: './message-actions-sheet.component.html',
  styleUrl: './message-actions-sheet.component.scss',
})
export class MessageActionsSheetComponent {
  private readonly dialogRef = inject<DialogRef<MessageActionsSheetResult>>(DialogRef);

  protected readonly actions = inject<MessageActionsSheetData>(DIALOG_DATA).items;
  protected readonly emoji = QUICK_EMOJI;
  protected readonly labelOf = reactionLabel;

  protected react(emoji: string): void {
    this.dialogRef.close({ kind: 'react', emoji });
  }

  protected run(kind: MessageMenuKind): void {
    this.dialogRef.close({ kind });
  }
}
