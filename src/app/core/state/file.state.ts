import { effect, inject, Service, signal, untracked } from '@angular/core';
import { FilesData } from '../data/files.data';
import { FileItem } from '../models/file-item';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

@Service()
export class FileState {
  private readonly data = inject(FilesData);
  private readonly dataMode = inject(DataModeState);

  readonly files = signal<readonly FileItem[]>([]);

  private readonly loader = new Loadable<readonly FileItem[]>({
    fetch: () => this.data.getFiles(),
    store: (files) => this.files.set(files),
    isEmpty: (files) => files.length === 0,
  });

  readonly status = this.loader.status;

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
}
