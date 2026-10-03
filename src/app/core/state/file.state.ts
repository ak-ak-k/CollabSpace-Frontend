import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { FilesData } from '../data/files.data';
import { FileItem } from '../models/file-item';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

@Service()
export class FileState {
  private readonly data = inject(FilesData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allFiles = signal<readonly FileItem[]>([]);

  private readonly loader = new Loadable<readonly FileItem[]>({
    fetch: () => this.data.getFiles(),
    store: (files) => this.allFiles.set(files),
    isEmpty: (files) => files.length === 0,
  });

  readonly files = computed(() => this.allFiles().filter((file) => this.workspace.contains(file)));
  readonly status = settledStatus(this.loader.status, () => this.files().length === 0);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  filesAt(locations: ReadonlySet<string>): readonly FileItem[] {
    return this.files().filter((file) => locations.has(file.location));
  }

  file(id: string): FileItem | null {
    return this.files().find((file) => file.id === id) ?? null;
  }

  toggleStar(id: string): void {
    this.allFiles.update((files) =>
      files.map((file) => (file.id === id ? { ...file, starred: !file.starred } : file)),
    );
    void this.data.toggleStar(id);
  }

  remove(id: string): FileItem | null {
    const removed = this.file(id);
    if (removed) {
      this.allFiles.update((files) => files.filter((file) => file.id !== id));
      void this.data.deleteFile(id);
    }
    return removed;
  }

  restore(file: FileItem): void {
    this.allFiles.update((files) => [file, ...files.filter((current) => current.id !== file.id)]);
    void this.data.restoreFile(file);
  }

  async upload(name: string): Promise<FileItem> {
    const file = await this.data.uploadFile(name, this.workspace.currentWorkspaceId());
    this.allFiles.update((files) => [file, ...files]);
    return file;
  }
}
