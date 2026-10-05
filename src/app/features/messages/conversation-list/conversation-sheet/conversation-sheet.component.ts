import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import type { RowActionKind, RowMenuItem } from '../conversation-row-actions.service';

export interface ConversationSheetData {
  readonly title: string;
  readonly items: readonly RowMenuItem[];
}

@Component({
  selector: 'app-conversation-sheet',
  imports: [CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './conversation-sheet.component.html',
  styleUrl: './conversation-sheet.component.scss',
})
export class ConversationSheetComponent {
  private readonly dialogRef = inject<DialogRef<RowActionKind>>(DialogRef);
  protected readonly data = inject<ConversationSheetData>(DIALOG_DATA);

  protected choose(kind: RowActionKind): void {
    this.dialogRef.close(kind);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
