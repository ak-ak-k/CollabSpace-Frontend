import { Pipe, PipeTransform } from '@angular/core';

const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = 1_048_576;

export const formatFileSize = (bytes: number): string => {
  if (bytes < BYTES_PER_KILOBYTE) {
    return `${bytes} B`;
  }
  if (bytes < BYTES_PER_MEGABYTE) {
    return `${Math.round(bytes / BYTES_PER_KILOBYTE)} KB`;
  }
  return `${(bytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
};

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    return bytes === null || bytes === undefined ? '' : formatFileSize(bytes);
  }
}
