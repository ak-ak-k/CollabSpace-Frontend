import { FILE_TYPE_LABELS, FileItem, FileType, FileView } from '../../core/models/file-item';
import { User, userColorSeed } from '../../core/models/user';
import { formatWhen } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { ALL_FILE_TYPES, FILE_FOLDERS, FileSort } from './files-options';

export type FileActionKind = 'star' | 'download' | 'share' | 'remove';

export interface FileRow {
  readonly id: string;
  readonly name: string;
  readonly type: FileType;
  readonly typeLabel: string;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly modifiedAt: number;
  readonly when: string;
  readonly location: string;
  readonly ownerName: string;
  readonly ownerFullName: string;
  readonly ownerSeed: number;
  readonly mine: boolean;
  readonly shared: boolean;
  readonly starred: boolean;
  readonly starLabel: string;
  readonly cardMeta: string;
  readonly listMeta: string;
}

export interface FileActionRequest {
  readonly kind: FileActionKind;
  readonly file: FileRow;
}

export interface FileFilters {
  readonly folder: FileView;
  readonly query: string;
  readonly type: string;
}

export interface EmptyCopy {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
}

const UNKNOWN_OWNER = 'Unknown';
const OWN_FILE_OWNER = 'You';
const META_SEPARATOR = ' · ';

export const toFileRow = (
  file: FileItem,
  usersById: ReadonlyMap<string, User>,
  currentUserId: string,
): FileRow => {
  const mine = file.ownerId === currentUserId;
  const ownerFullName = usersById.get(file.ownerId)?.name ?? UNKNOWN_OWNER;
  const ownerName = mine ? OWN_FILE_OWNER : ownerFullName;
  const typeLabel = FILE_TYPE_LABELS[file.type];
  const when = formatWhen(file.modifiedAt);
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    typeLabel,
    sizeLabel: file.sizeLabel,
    bytes: file.bytes,
    modifiedAt: file.modifiedAt,
    when,
    location: file.location,
    ownerName,
    ownerFullName,
    ownerSeed: userColorSeed(file.ownerId),
    mine,
    shared: file.shared,
    starred: file.starred,
    starLabel: `${file.starred ? 'Unstar' : 'Star'} ${file.name}`,
    cardMeta: [typeLabel, file.sizeLabel, when].join(META_SEPARATOR),
    listMeta: [typeLabel, file.sizeLabel, ownerName, when].join(META_SEPARATOR),
  };
};

const FOLDER_MATCHERS: Record<FileView, (row: FileRow) => boolean> = {
  recent: () => true,
  shared: (row) => row.shared && !row.mine,
  mine: (row) => row.mine,
  starred: (row) => row.starred,
};

export const inFolder = (rows: readonly FileRow[], folder: FileView): readonly FileRow[] =>
  rows.filter(FOLDER_MATCHERS[folder]);

export const countByFolder = (rows: readonly FileRow[]): Record<FileView, number> =>
  Object.fromEntries(
    FILE_FOLDERS.map((folder) => [folder.id, inFolder(rows, folder.id).length]),
  ) as Record<FileView, number>;

const matchesQuery = (row: FileRow, query: string): boolean =>
  [row.name, row.ownerName, row.ownerFullName].some((text) => text.toLowerCase().includes(query));

export const hasActiveFilters = (filters: FileFilters): boolean =>
  filters.query.trim() !== '' || filters.type !== ALL_FILE_TYPES;

export const filterRows = (rows: readonly FileRow[], filters: FileFilters): readonly FileRow[] => {
  const query = filters.query.trim().toLowerCase();
  return inFolder(rows, filters.folder).filter(
    (row) =>
      (filters.type === ALL_FILE_TYPES || row.type === filters.type) &&
      (!query || matchesQuery(row, query)),
  );
};

const COMPARATORS: Record<FileSort['key'], (first: FileRow, second: FileRow) => number> = {
  name: (first, second) => first.name.localeCompare(second.name),
  size: (first, second) => first.bytes - second.bytes,
  modified: (first, second) => first.modifiedAt - second.modifiedAt,
};

export const sortRows = (rows: readonly FileRow[], sort: FileSort): readonly FileRow[] => {
  const direction = sort.direction === 'asc' ? 1 : -1;
  const compare = COMPARATORS[sort.key];
  return [...rows].sort((first, second) => compare(first, second) * direction);
};

export const pageOf = <Row>(
  rows: readonly Row[],
  page: number,
  pageSize: number,
): readonly Row[] => {
  const lastPage = Math.max(Math.ceil(rows.length / pageSize), 1);
  const start = (Math.min(Math.max(page, 1), lastPage) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
};

const FOLDER_EMPTY_COPY: Record<FileView, EmptyCopy> = {
  recent: {
    icon: 'folder-open',
    heading: 'No files yet',
    message: 'Upload a file or share one in a conversation to see it here.',
    actionLabel: 'Upload a file',
  },
  shared: {
    icon: 'share-2',
    heading: 'No shared files',
    message: 'When teammates share files with you, they’ll appear here.',
    actionLabel: '',
  },
  mine: {
    icon: 'upload',
    heading: 'No files yet',
    message: 'Upload your first file to keep it with your team’s work.',
    actionLabel: 'Upload a file',
  },
  starred: {
    icon: 'star',
    heading: 'Nothing starred',
    message: 'Star important files to find them quickly.',
    actionLabel: '',
  },
};

const NO_MATCH_COPY: EmptyCopy = {
  icon: 'search',
  heading: 'No files found',
  message: 'No files match your search or type filter.',
  actionLabel: '',
};

export const emptyCopyFor = (folder: FileView, filtered: boolean): EmptyCopy =>
  filtered ? NO_MATCH_COPY : FOLDER_EMPTY_COPY[folder];
