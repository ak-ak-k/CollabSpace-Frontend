import { inject, Service } from '@angular/core';
import { MOCK_FILES } from '../mocks/files.mock';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { FileItem, fileTypeOf } from '../models/file-item';
import { MockRequest } from './mock-request';

const UPLOADED_FILE_BYTES = 1_200_000;
const UPLOADED_FILE_SIZE_LABEL = '1.2 MB';
const PRIVATE_LOCATION = 'Only you';

@Service()
export class FilesData {
  private readonly request = inject(MockRequest);

  private files = [...MOCK_FILES];
  private uploadedFiles = 0;

  getFiles(): Promise<readonly FileItem[]> {
    return this.request.read(() => this.files, []);
  }

  uploadFile(name: string): Promise<FileItem> {
    return this.request.write(() => {
      const file: FileItem = {
        id: `f-new-${++this.uploadedFiles}`,
        name,
        type: fileTypeOf(name),
        sizeLabel: UPLOADED_FILE_SIZE_LABEL,
        bytes: UPLOADED_FILE_BYTES,
        ownerId: CURRENT_USER_ID,
        modifiedAt: Date.now(),
        location: PRIVATE_LOCATION,
        shared: false,
        starred: false,
      };
      this.files = [file, ...this.files];
      return file;
    });
  }

  toggleStar(id: string): Promise<void> {
    return this.request.write(() => {
      this.files = this.files.map((file) =>
        file.id === id ? { ...file, starred: !file.starred } : file,
      );
    });
  }

  deleteFile(id: string): Promise<void> {
    return this.request.write(() => {
      this.files = this.files.filter((file) => file.id !== id);
    });
  }

  restoreFile(file: FileItem): Promise<void> {
    return this.request.write(() => {
      this.files = [file, ...this.files];
    });
  }
}
