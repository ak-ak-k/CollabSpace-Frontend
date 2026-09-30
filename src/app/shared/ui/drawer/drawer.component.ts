import { DialogRef } from '@angular/cdk/dialog';
import { booleanAttribute, Component, inject, input } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { labelEnclosingDialog } from '../modal/dialog-container/dialog-label';
import { createOverlayId } from '../modal/overlay-id';

@Component({
  selector: 'app-drawer',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  private readonly dialogRef = inject(DialogRef, { optional: true });

  readonly heading = input.required<string>();
  readonly hideHeading = input(false, { transform: booleanAttribute });
  readonly titleId = createOverlayId('drawer-title');

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected close(): void {
    this.dialogRef?.close();
  }
}
