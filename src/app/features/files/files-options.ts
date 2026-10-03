import { FILE_TYPE_LABELS, FileView } from '../../core/models/file-item';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { RadioOption } from '../../shared/ui/radio/radio-group.component';
import { SelectOption } from '../../shared/ui/select/select.component';
import { SortDirection } from '../../shared/ui/table/sort-header.component';

export type FileLayout = 'list' | 'grid';
export type FileSortKey = 'name' | 'size' | 'modified';

export interface FileSort {
  readonly key: FileSortKey;
  readonly direction: SortDirection;
}

export interface FileFolder {
  readonly id: FileView;
  readonly label: string;
  readonly icon: IconName;
  readonly description: string;
}

export interface FileSortOption extends SelectOption {
  readonly sort: FileSort;
}

export const ALL_FILE_TYPES = 'all';
export const FILES_PER_PAGE = 8;
export const DEFAULT_FILE_FOLDER: FileView = 'recent';
export const DEFAULT_FILE_SORT: FileSort = { key: 'modified', direction: 'desc' };

export const FILE_FOLDERS: readonly FileFolder[] = [
  {
    id: 'recent',
    label: 'Recent files',
    icon: 'clock',
    description: 'Everything shared with you and by you, newest first.',
  },
  {
    id: 'shared',
    label: 'Shared with me',
    icon: 'share-2',
    description: 'Files your teammates shared in channels and DMs.',
  },
  { id: 'mine', label: 'My files', icon: 'folder', description: 'Files you uploaded.' },
  {
    id: 'starred',
    label: 'Starred',
    icon: 'star',
    description: 'Files you starred for quick access.',
  },
];

export const FILE_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: ALL_FILE_TYPES, label: 'All types' },
  ...Object.entries(FILE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export const FILE_LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
];

const sortOption = (key: FileSortKey, direction: SortDirection, label: string): FileSortOption => ({
  value: `${key}-${direction}`,
  label,
  sort: { key, direction },
});

export const FILE_SORT_OPTIONS: readonly FileSortOption[] = [
  sortOption('modified', 'desc', 'Newest first'),
  sortOption('modified', 'asc', 'Oldest first'),
  sortOption('name', 'asc', 'Name (A–Z)'),
  sortOption('name', 'desc', 'Name (Z–A)'),
  sortOption('size', 'desc', 'Largest first'),
  sortOption('size', 'asc', 'Smallest first'),
];

export const folderOf = (value: string | undefined): FileView =>
  FILE_FOLDERS.find((folder) => folder.id === value)?.id ?? DEFAULT_FILE_FOLDER;

export const folderMeta = (id: FileView): FileFolder =>
  FILE_FOLDERS.find((folder) => folder.id === id) ?? FILE_FOLDERS[0];

export const sortValueOf = (sort: FileSort): string => `${sort.key}-${sort.direction}`;

export const sortFromValue = (value: string): FileSort =>
  FILE_SORT_OPTIONS.find((option) => option.value === value)?.sort ?? DEFAULT_FILE_SORT;

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
