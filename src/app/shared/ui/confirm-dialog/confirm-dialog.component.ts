import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import {
  confirmBodyId,
  ConfirmDialogData,
  confirmTitleId,
  confirmTypeId,
} from './confirm-dialog-data';

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
  protected readonly typeId = confirmTypeId(this.dialogRef.id);
  protected readonly needsTyping = this.data.confirmText.length > 0;
  protected readonly focusesCancel = !this.needsTyping && this.data.tone === 'danger';
  protected readonly focusesConfirm = !this.needsTyping && !this.focusesCancel;
  protected readonly typed = signal('');
  protected readonly blocked = computed(
    () => this.needsTyping && this.typed().trim() !== this.data.confirmText,
  );

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    if (!this.blocked()) {
      this.dialogRef.close(true);
    }
  }

  protected confirmTyped(event: Event): void {
    event.preventDefault();
    this.confirm();
  }
}
