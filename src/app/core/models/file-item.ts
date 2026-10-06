import { IconName } from '../../shared/ui/icon/icon-registry';

export type FileType =
  'pdf' | 'design' | 'code' | 'image' | 'sheet' | 'doc' | 'archive' | 'video' | 'slides';

export type FileView = 'recent' | 'shared' | 'mine' | 'starred';

export interface UploadSource {
  readonly type: 'upload';
}

export interface MessageSource {
  readonly type: 'message';
  readonly conversationId: string;
  readonly messageId: string | null;
}

export interface TaskSource {
  readonly type: 'task';
  readonly taskId: string;
}

export type FileSource = UploadSource | MessageSource | TaskSource;

export type FileSourceKind = FileSource['type'];

export interface FileItem {
  readonly workspaceId: string;
  readonly id: string;
  readonly name: string;
  readonly extension: string;
  readonly type: FileType;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly ownerId: string;
  readonly uploadedAt: number;
  readonly modifiedAt: number;
  readonly location: string;
  readonly shared: boolean;
  readonly starred: boolean;
  readonly source: FileSource;
  readonly teamId: string | null;
  readonly taskIds: readonly string[];
  readonly previewUrl: string | null;
}

export interface FileDraft {
  readonly name: string;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly type?: FileType;
  readonly previewUrl?: string | null;
}

export interface TeamFileDraft extends FileDraft {
  readonly teamId?: string | null;
}

export const UPLOAD_SOURCE: UploadSource = { type: 'upload' };

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

export const FILE_TYPES = Object.keys(FILE_TYPE_LABELS) as FileType[];

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

const EXTENSION_PATTERN = /\.([a-z0-9]+)$/i;

export const extensionOf = (fileName: string): string =>
  EXTENSION_PATTERN.exec(fileName)?.[1]?.toLowerCase() ?? '';

export const fileTypeOf = (fileName: string): FileType =>
  FILE_TYPES_BY_EXTENSION[extensionOf(fileName)] ?? 'doc';

export const filePreviewRouteOf = (fileId: string): string => `/files/recent?file=${fileId}`;
