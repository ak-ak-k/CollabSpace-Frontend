import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, input } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { labelEnclosingDialog } from './dialog-container/dialog-label';
import { OverlaySize } from './dialog-container/dialog-panel';
import { createOverlayId } from './overlay-id';

export type ModalSize = OverlaySize;

@Component({
  selector: 'app-modal',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  host: {
    '[class.modal--sm]': 'size() === "sm"',
    '[class.modal--md]': 'size() === "md"',
    '[class.modal--lg]': 'size() === "lg"',
  },
})
export class ModalComponent {
  private readonly dialogRef = inject(DialogRef, { optional: true });

  readonly heading = input.required<string>();
  readonly description = input('');
  readonly size = input<ModalSize>();
  readonly titleId = createOverlayId('modal-title');

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected close(): void {
    this.dialogRef?.close();
  }
}
