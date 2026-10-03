import { DOCUMENT, inject, Service } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { FileState } from '../../core/state/file.state';
import { FileRow } from './files-view';

const SHARE_LINK_PATH = '/files/recent?file=';

@Service()
export class FileActions {
  private readonly files = inject(FileState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  toggleStar(file: FileRow): void {
    this.files.toggleStar(file.id);
  }

  download(file: FileRow): void {
    this.toasts.show(`Downloading ${file.name}`, { icon: 'download' });
  }

  async share(file: FileRow): Promise<void> {
    const link = `${this.document.location.origin}${SHARE_LINK_PATH}${encodeURIComponent(file.id)}`;
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(link);
      this.toasts.show(`Share link for ${file.name} copied`, { icon: 'link' });
    } catch {
      this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
        icon: 'circle-alert',
      });
    }
  }

  async remove(file: FileRow): Promise<boolean> {
    const confirmed = await this.dialogs.confirm({
      title: `Delete “${file.name}”?`,
      body: 'It will be removed from every conversation it was shared in.',
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

  async upload(names: readonly string[]): Promise<void> {
    if (names.length === 0) {
      return;
    }
    await Promise.all(names.map((name) => this.files.upload(name)));
    const message = names.length === 1 ? `${names[0]} uploaded` : `${names.length} files uploaded`;
    this.toasts.show(message, { icon: 'upload' });
  }
}
