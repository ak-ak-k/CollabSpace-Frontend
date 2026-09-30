import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { confirmBodyId, ConfirmDialogData, confirmTitleId } from './confirm-dialog-data';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  host: {
    '[class.confirm-dialog--neutral]': 'data.tone === "neutral"',
  },
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly titleId = confirmTitleId(this.dialogRef.id);
  protected readonly bodyId = confirmBodyId(this.dialogRef.id);
  protected readonly focusesCancel = this.data.tone === 'danger';

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
