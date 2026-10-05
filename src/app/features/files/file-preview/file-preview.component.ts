import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal } from '@angular/core';
import { FILE_TYPE_ICONS } from '../../../core/models/file-item';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { FileActions } from '../file-actions.service';
import { FileCatalog } from '../file-catalog.service';
import { FilePreviewBodyComponent } from '../file-preview-body/file-preview-body.component';
import { FilePreviewDetailsComponent } from '../file-preview-details/file-preview-details.component';
import { FileRow } from '../files-view';

export interface FilePreviewData {
  readonly fileId: Signal<string>;
}

export type FilePreviewResult = 'removed';

const UNAVAILABLE_TITLE = 'File unavailable';

@Component({
  selector: 'app-file-preview',
  imports: [
    FilePreviewBodyComponent,
    FilePreviewDetailsComponent,
    IconButtonComponent,
    IconComponent,
  ],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.scss',
})
export class FilePreviewComponent {
  private readonly dialogRef = inject<DialogRef<FilePreviewResult>>(DialogRef);
  private readonly catalog = inject(FileCatalog);
  private readonly actions = inject(FileActions);
  private readonly fileId = inject<FilePreviewData>(DIALOG_DATA).fileId;

  protected readonly titleId = createOverlayId('file-preview-title');
  protected readonly file = computed(() => this.catalog.row(this.fileId()));
  protected readonly references = computed(() => this.catalog.referencesOf(this.fileId()));
  protected readonly title = computed(() => this.file()?.name ?? UNAVAILABLE_TITLE);
  protected readonly icon = computed(() => {
    const file = this.file();
    return file ? FILE_TYPE_ICONS[file.type] : 'circle-alert';
  });

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected download(file: FileRow): void {
    this.actions.download(file);
  }

  protected star(file: FileRow): void {
    this.actions.toggleStar(file);
  }

  protected rename(file: FileRow): void {
    void this.actions.rename(file);
  }

  protected copyLink(file: FileRow): void {
    void this.actions.copyLink(file);
  }

  protected remove(): void {
    this.dialogRef.close('removed');
  }
}
