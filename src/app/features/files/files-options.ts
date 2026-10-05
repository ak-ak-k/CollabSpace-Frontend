import {
  FILE_TYPE_LABELS,
  FILE_TYPES,
  FileSourceKind,
  FileType,
  FileView,
} from '../../core/models/file-item';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { RadioOption } from '../../shared/ui/radio/radio-group.component';
import { SortDirection } from '../../shared/ui/table/sort-header.component';

export type FileLayout = 'list' | 'grid';
export type FileSortKey = 'name' | 'size' | 'modified';
export type FileSourceFilter = 'any' | FileSourceKind;
export type FileModifiedFilter = 'any' | '7' | '30';

export interface FileSort {
  readonly key: FileSortKey;
  readonly direction: SortDirection;
}

export interface FileFolder {
  readonly id: FileView;
  readonly label: string;
  readonly short: string;
  readonly icon: IconName;
  readonly description: string;
}

export interface FileTypeOption {
  readonly value: FileType;
  readonly label: string;
}

export const FILES_PER_PAGE = 8;
export const DEFAULT_FILE_FOLDER: FileView = 'recent';
export const DEFAULT_FILE_SORT: FileSort = { key: 'modified', direction: 'desc' };
export const OFFLINE_UPLOAD_MESSAGE = 'You’re offline. Upload when you’re back online.';

export const FILE_FOLDERS: readonly FileFolder[] = [
  {
    id: 'recent',
    label: 'Recent files',
    short: 'Recent',
    icon: 'clock',
    description: 'Everything you can access, newest first.',
  },
  {
    id: 'shared',
    label: 'Shared in conversations & tasks',
    short: 'Shared',
    icon: 'share-2',
    description: 'Files teammates attached to messages and tasks.',
  },
  {
    id: 'mine',
    label: 'My files',
    short: 'Mine',
    icon: 'folder',
    description: 'Files you uploaded or attached.',
  },
  {
    id: 'starred',
    label: 'Starred',
    short: 'Starred',
    icon: 'star',
    description: 'Files you starred — only you see your stars.',
  },
];

export const FILE_LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
];

export const FILE_TYPE_OPTIONS: readonly FileTypeOption[] = FILE_TYPES.map((value) => ({
  value,
  label: FILE_TYPE_LABELS[value],
}));

export const FILE_SOURCE_LABELS: Record<FileSourceKind, string> = {
  upload: 'Uploads',
  message: 'Conversations',
  task: 'Tasks',
};

export const FILE_SOURCE_OPTIONS: readonly RadioOption[] = [
  { value: 'any', label: 'Any' },
  { value: 'upload', label: FILE_SOURCE_LABELS.upload },
  { value: 'message', label: FILE_SOURCE_LABELS.message },
  { value: 'task', label: FILE_SOURCE_LABELS.task },
];

export const FILE_MODIFIED_OPTIONS: readonly RadioOption[] = [
  { value: 'any', label: 'Any time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

export const folderOf = (value: string | undefined): FileView =>
  FILE_FOLDERS.find((folder) => folder.id === value)?.id ?? DEFAULT_FILE_FOLDER;

export const folderMeta = (id: FileView): FileFolder =>
  FILE_FOLDERS.find((folder) => folder.id === id) ?? FILE_FOLDERS[0];

export const nextSort = (current: FileSort, key: FileSortKey): FileSort => {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { key, direction: key === 'name' ? 'asc' : 'desc' };
};

const SORT_DESCRIPTIONS: Record<FileSortKey, Record<SortDirection, string>> = {
  name: { asc: 'name, A to Z', desc: 'name, Z to A' },
  size: { asc: 'size, smallest first', desc: 'size, largest first' },
  modified: { asc: 'last modified, oldest first', desc: 'last modified, newest first' },
};

export const sortDescription = (sort: FileSort): string =>
  SORT_DESCRIPTIONS[sort.key][sort.direction];

export const isSourceFilter = (value: string): value is FileSourceFilter =>
  FILE_SOURCE_OPTIONS.some((option) => option.value === value);

export const isModifiedFilter = (value: string): value is FileModifiedFilter =>
  FILE_MODIFIED_OPTIONS.some((option) => option.value === value);
