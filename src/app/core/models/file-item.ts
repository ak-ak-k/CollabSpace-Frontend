import { IconName } from '../../shared/ui/icon/icon-registry';

export type FileType =
  'pdf' | 'design' | 'code' | 'image' | 'sheet' | 'doc' | 'archive' | 'video' | 'slides';

export type FileView = 'recent' | 'shared' | 'mine' | 'starred';

export interface FileItem {
  readonly id: string;
  readonly name: string;
  readonly type: FileType;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly ownerId: string;
  readonly modifiedAt: number;
  readonly location: string;
  readonly shared: boolean;
  readonly starred: boolean;
}

export const FILE_TYPE_ICONS: Record<FileType, IconName> = {
  pdf: 'file-text',
  design: 'pen-tool',
  code: 'file-code',
  image: 'image',
  sheet: 'file-spreadsheet',
  doc: 'file-text',
  archive: 'file-archive',
  video: 'file-video',
  slides: 'presentation',
};

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  design: 'Figma',
  code: 'Code',
  image: 'Image',
  sheet: 'Spreadsheet',
  doc: 'Document',
  archive: 'Archive',
  video: 'Video',
  slides: 'Slides',
};

const FILE_TYPES_BY_EXTENSION: Record<string, FileType> = {
  pdf: 'pdf',
  fig: 'design',
  md: 'code',
  yaml: 'code',
  json: 'code',
  js: 'code',
  ts: 'code',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  svg: 'image',
  xlsx: 'sheet',
  csv: 'sheet',
  docx: 'doc',
  doc: 'doc',
  zip: 'archive',
  mp4: 'video',
  mov: 'video',
  pptx: 'slides',
  key: 'slides',
};

export const fileTypeOf = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPES_BY_EXTENSION[extension] ?? 'doc';
};
