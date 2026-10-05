import { DialogRef } from '@angular/cdk/dialog';
import { DOCUMENT, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { FileState } from '../../core/state/file.state';
import {
  FileMenuSheetComponent,
  FileMenuSheetData,
} from './file-menu-sheet/file-menu-sheet.component';
import {
  FileRenameData,
  FileRenameDialogComponent,
} from './file-rename-dialog/file-rename-dialog.component';
import { FileActionKind, fileMenuItems, FileRow } from './files-view';

export const FILE_QUERY_PARAM = 'file';
const SHARE_LINK_PATH = '/files/recent';

@Service()
export class FileActions {
  private readonly files = inject(FileState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  preview(fileId: string): void {
    void this.router.navigate([], {
      queryParams: { [FILE_QUERY_PARAM]: fileId },
      queryParamsHandling: 'merge',
    });
  }

  toggleStar(file: FileRow): void {
    this.files.toggleStar(file.id);
  }

  download(file: FileRow): void {
    this.toasts.show(`Downloading ${file.name}`, { icon: 'download' });
  }

  async copyLink(file: FileRow): Promise<void> {
    const link = `${this.document.location.origin}${SHARE_LINK_PATH}?${FILE_QUERY_PARAM}=${encodeURIComponent(file.id)}`;
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(link);
      this.toasts.show(`Link to ${file.name} copied`, { icon: 'link' });
    } catch {
      this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
        icon: 'circle-alert',
      });
    }
  }

  openSource(file: FileRow): void {
    const link = file.source.link;
    if (link) {
      void this.router.navigate([link.path], { queryParams: link.queryParams });
    }
  }

  async rename(file: FileRow): Promise<void> {
    const dialog = this.dialogs.open<string, FileRenameData>(FileRenameDialogComponent, {
      size: 'sm',
      data: { name: file.name },
    });
    const name = await firstValueFrom(dialog.closed, { defaultValue: undefined });
    const previous = name && name !== file.name ? this.files.rename(file.id, name) : null;
    if (previous && name) {
      this.toasts.show(`Renamed to ${name}`, {
        icon: 'pencil',
        actionLabel: 'Undo',
        onAction: () => this.files.rename(file.id, previous.name),
      });
    }
  }

  async remove(file: FileRow): Promise<boolean> {
    const confirmed = await this.dialogs.confirm({
      title: `Delete “${file.name}”?`,
      body: 'It may no longer be available in the conversations or tasks where it was shared.',
      confirmLabel: 'Delete file',
      icon: 'trash-2',
    });
    const removed = confirmed ? this.files.remove(file.id) : null;
    if (removed) {
      this.toasts.show('File deleted', {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => this.files.restore(removed),
      });
    }
    return removed !== null;
  }

  openSheet(file: FileRow): DialogRef<FileActionKind> {
    return this.dialogs.openDrawer<FileActionKind, FileMenuSheetData>(FileMenuSheetComponent, {
      side: 'bottom',
      data: { title: file.name, items: fileMenuItems(file) },
      ariaLabel: `Actions for ${file.name}`,
    });
  }
}
