import { DialogRef } from '@angular/cdk/dialog';
import { DestroyRef, DOCUMENT, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../core/services/dialog.service';
import { FILE_QUERY_PARAM } from '../file-actions.service';
import { FilePreviewComponent, FilePreviewData, FilePreviewResult } from './file-preview.component';

export interface FilePreviewHooks {
  readonly removeRequested: (fileId: string) => void;
  readonly focusLost: () => void;
}

export class FilePreviewController {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly fileId = signal('');
  private dialogRef: DialogRef<FilePreviewResult> | null = null;
  private destroyed = false;

  constructor(private readonly hooks: FilePreviewHooks) {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.dialogRef?.close();
    });
  }

  sync(fileId: string, ready: boolean): void {
    if (fileId && ready) {
      this.show(fileId);
    } else if (!fileId) {
      this.dialogRef?.close();
    }
  }

  private show(fileId: string): void {
    this.fileId.set(fileId);
    if (this.dialogRef) {
      return;
    }
    const dialogRef = this.dialogs.open<FilePreviewResult, FilePreviewData>(FilePreviewComponent, {
      size: 'lg',
      data: { fileId: this.fileId.asReadonly() },
    });
    this.dialogRef = dialogRef;
    dialogRef.closed.subscribe((result) => this.afterClose(dialogRef, result));
  }

  private afterClose(dialogRef: DialogRef<FilePreviewResult>, result?: FilePreviewResult): void {
    if (this.dialogRef !== dialogRef) {
      return;
    }
    this.dialogRef = null;
    if (this.destroyed) {
      return;
    }
    if (this.router.parseUrl(this.router.url).queryParamMap.has(FILE_QUERY_PARAM)) {
      void this.router.navigate([], {
        queryParams: { [FILE_QUERY_PARAM]: null },
        queryParamsHandling: 'merge',
      });
    }
    if (result === 'removed') {
      this.hooks.removeRequested(this.fileId());
    } else {
      setTimeout(() => this.recoverFocus());
    }
  }

  private recoverFocus(): void {
    const focused = this.document.activeElement;
    if (!focused || focused === this.document.body) {
      this.hooks.focusLost();
    }
  }
}
