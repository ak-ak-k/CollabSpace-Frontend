import { inject, Service } from '@angular/core';
import { MOCK_FILES } from '../mocks/files.mock';
import { FileItem } from '../models/file-item';
import { MockRequest } from './mock-request';

export type NewFile = Omit<FileItem, 'id'>;

export type FileChanges = Partial<Pick<FileItem, 'name' | 'modifiedAt' | 'starred' | 'taskIds'>>;

const NEW_FILE_PREFIX = 'f-new-';

@Service()
export class FilesData {
  private readonly request = inject(MockRequest);

  private files = [...MOCK_FILES];
  private createdFiles = 0;

  getFiles(): Promise<readonly FileItem[]> {
    return this.request.read(() => this.files, []);
  }

  addFile(draft: NewFile): Promise<FileItem> {
    return this.request.write(() => {
      const file: FileItem = { ...draft, id: `${NEW_FILE_PREFIX}${++this.createdFiles}` };
      this.files = [file, ...this.files];
      return file;
    });
  }

  updateFile(id: string, changes: FileChanges): Promise<void> {
    return this.request.write(() => {
      this.files = this.files.map((file) => (file.id === id ? { ...file, ...changes } : file));
    });
  }

  deleteFile(id: string): Promise<void> {
    return this.request.write(() => {
      this.files = this.files.filter((file) => file.id !== id);
    });
  }

  restoreFile(file: FileItem): Promise<void> {
    return this.request.write(() => {
      this.files = [file, ...this.files.filter((current) => current.id !== file.id)];
    });
  }
}
