import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../ui/icon/icon.component';
import { labelEnclosingDialog } from '../../ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../ui/modal/overlay-id';

export interface ImageViewerData {
  readonly name: string;
  readonly size: string;
  readonly src: string;
}

const DOWNLOAD_ICON_SIZE = 20;
const CLOSE_ICON_SIZE = 22;
const PLACEHOLDER_ICON_SIZE = 48;

@Component({
  selector: 'app-image-viewer',
  imports: [IconComponent],
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent {
  private readonly dialogRef = inject(DialogRef);
  private readonly toasts = inject(ToastService);

  protected readonly image = inject<ImageViewerData>(DIALOG_DATA);
  protected readonly titleId = createOverlayId('image-viewer-title');
  protected readonly downloadIconSize = DOWNLOAD_ICON_SIZE;
  protected readonly closeIconSize = CLOSE_ICON_SIZE;
  protected readonly placeholderIconSize = PLACEHOLDER_ICON_SIZE;

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected download(): void {
    this.toasts.show(`Downloading ${this.image.name}`, { icon: 'download' });
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
