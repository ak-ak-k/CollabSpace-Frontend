import { LiveAnnouncer } from '@angular/cdk/a11y';
import { computed, DOCUMENT, inject, Service, signal } from '@angular/core';
import { FileType, fileTypeOf } from '../../core/models/file-item';
import { ToastService } from '../../core/services/toast.service';
import { FileState } from '../../core/state/file.state';
import { NetworkState } from '../../core/state/network.state';
import { formatFileSize } from '../../shared/pipes/file-size.pipe';
import { OFFLINE_UPLOAD_MESSAGE } from './files-options';

export type UploadStatus = 'uploading' | 'done' | 'failed';

export interface UploadItem {
  readonly id: string;
  readonly name: string;
  readonly type: FileType;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly teamId: string | null;
  readonly previewUrl: string | null;
  readonly progress: number;
  readonly status: UploadStatus;
  readonly failsOnce: boolean;
}

const TICK_MILLISECONDS = 320;
const PROGRESS_STEP = 24;
const FAILURE_PROGRESS = 60;
const COMPLETE = 100;
const FAILING_NAME = /fail/i;
const IMAGE_MIME = /^image\//;

type UploadTimer = ReturnType<typeof setInterval>;

@Service()
export class FileUploads {
  private readonly fileState = inject(FileState);
  private readonly network = inject(NetworkState);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly toasts = inject(ToastService);
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly timers = new Map<string, UploadTimer>();
  private sequence = 0;

  readonly items = signal<readonly UploadItem[]>([]);
  readonly uploadingCount = computed(
    () => this.items().filter((item) => item.status === 'uploading').length,
  );
  readonly hasFinished = computed(() => this.items().some((item) => item.status !== 'uploading'));
  readonly title = computed(() => {
    const uploading = this.uploadingCount();
    return uploading ? `Uploading ${uploading} of ${this.items().length}` : 'Uploads';
  });

  start(files: readonly File[], teamId: string | null): void {
    if (files.length === 0) {
      return;
    }
    if (this.network.offline()) {
      this.toasts.show(OFFLINE_UPLOAD_MESSAGE, { icon: 'cloud-off' });
      return;
    }
    const added = files.map((file) => this.itemFor(file, teamId));
    this.items.update((items) => [...added, ...items]);
    this.announce(
      added.length === 1 ? `Uploading ${added[0].name}` : `Uploading ${added.length} files`,
    );
    added.forEach((item) => this.run(item.id));
  }

  retry(id: string): void {
    if (this.network.offline()) {
      this.toasts.show(OFFLINE_UPLOAD_MESSAGE, { icon: 'cloud-off' });
      return;
    }
    this.patch(id, { status: 'uploading', progress: 0 });
    this.run(id);
  }

  dismiss(id: string): void {
    this.stop(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  clearFinished(): void {
    this.items.update((items) => items.filter((item) => item.status === 'uploading'));
  }

  private itemFor(file: File, teamId: string | null): UploadItem {
    const isImage = IMAGE_MIME.test(file.type);
    return {
      id: `upload-${++this.sequence}`,
      name: file.name,
      type: isImage ? 'image' : fileTypeOf(file.name),
      sizeLabel: formatFileSize(file.size),
      bytes: file.size,
      teamId,
      previewUrl: isImage ? this.objectUrlOf(file) : null,
      progress: 0,
      status: 'uploading',
      failsOnce: FAILING_NAME.test(file.name),
    };
  }

  private objectUrlOf(file: File): string | null {
    try {
      return this.window?.URL.createObjectURL(file) ?? null;
    } catch {
      return null;
    }
  }

  private run(id: string): void {
    this.stop(id);
    this.timers.set(
      id,
      setInterval(() => this.advance(id), TICK_MILLISECONDS),
    );
  }

  private advance(id: string): void {
    const item = this.items().find((candidate) => candidate.id === id);
    if (!item || item.status !== 'uploading') {
      this.stop(id);
      return;
    }
    const progress = Math.min(COMPLETE, item.progress + PROGRESS_STEP);
    if ((item.failsOnce && progress >= FAILURE_PROGRESS) || this.network.offline()) {
      this.fail(item, progress);
    } else if (progress >= COMPLETE) {
      this.stop(id);
      this.patch(id, { progress: COMPLETE });
      void this.finish(item);
    } else {
      this.patch(id, { progress });
    }
  }

  private fail(item: UploadItem, progress: number): void {
    this.stop(item.id);
    this.patch(item.id, {
      progress: Math.min(progress, FAILURE_PROGRESS),
      status: 'failed',
      failsOnce: false,
    });
    this.announce(`${item.name} failed to upload`);
  }

  private async finish(item: UploadItem): Promise<void> {
    await this.fileState.upload({
      name: item.name,
      sizeLabel: item.sizeLabel,
      bytes: item.bytes,
      type: item.type,
      previewUrl: item.previewUrl,
      teamId: item.teamId,
    });
    this.patch(item.id, { status: 'done' });
    this.announce(`${item.name} uploaded`);
  }

  private patch(id: string, changes: Partial<UploadItem>): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  private stop(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
}
