import { FILE_TYPE_LABELS, FileItem, FileType, FileView } from '../../core/models/file-item';
import { FileSourceInfo, FileSourceLookup, sourceOf } from '../../core/models/file-source';
import { User, userColorSeed } from '../../core/models/user';
import { formatWhen } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { FILE_FOLDERS } from './files-options';

export type FileActionKind =
  'preview' | 'download' | 'star' | 'copy-link' | 'source' | 'rename' | 'remove';

export interface FileRow {
  readonly id: string;
  readonly name: string;
  readonly type: FileType;
  readonly typeLabel: string;
  readonly extension: string;
  readonly sizeLabel: string;
  readonly bytes: number;
  readonly uploadedAt: number;
  readonly modifiedAt: number;
  readonly modifiedLabel: string;
  readonly ownerId: string;
  readonly ownerName: string;
  readonly ownerFullName: string;
  readonly ownerSeed: number;
  readonly mine: boolean;
  readonly starred: boolean;
  readonly starLabel: string;
  readonly source: FileSourceInfo;
  readonly teamId: string | null;
  readonly teamName: string;
  readonly conversationId: string | null;
  readonly previewUrl: string | null;
  readonly canManage: boolean;
  readonly typeLine: string;
  readonly gridMeta: string;
  readonly listMeta: string;
  readonly openLabel: string;
  readonly menuLabel: string;
}

export interface FileRowContext {
  readonly usersById: ReadonlyMap<string, User>;
  readonly currentUserId: string;
  readonly isAdmin: boolean;
  readonly isGuest: boolean;
  readonly lookup: FileSourceLookup;
  readonly now: number;
}

export interface FileActionRequest {
  readonly kind: FileActionKind;
  readonly file: FileRow;
}

export interface FileMenuItem {
  readonly kind: FileActionKind;
  readonly label: string;
  readonly icon: IconName;
  readonly danger: boolean;
}

export type EmptyAction = 'upload' | 'clear' | null;

export interface EmptyCopy {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
  readonly actionIcon: IconName;
  readonly action: EmptyAction;
}

const UNKNOWN_OWNER = 'Unknown';
const OWN_FILE_OWNER = 'You';
const SEPARATOR = ' · ';

const typeLineOf = (typeLabel: string, extension: string, starred: boolean): string =>
  [typeLabel, extension ? `.${extension}` : '', starred ? 'Starred' : '']
    .filter((part) => part !== '')
    .join(SEPARATOR);

export const toFileRow = (file: FileItem, context: FileRowContext): FileRow => {
  const mine = file.ownerId === context.currentUserId;
  const ownerFullName = context.usersById.get(file.ownerId)?.name ?? UNKNOWN_OWNER;
  const typeLabel = FILE_TYPE_LABELS[file.type];
  const modifiedLabel = formatWhen(file.modifiedAt, context.now);
  const source = sourceOf(file, context.lookup);
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    typeLabel,
    extension: file.extension,
    sizeLabel: file.sizeLabel,
    bytes: file.bytes,
    uploadedAt: file.uploadedAt,
    modifiedAt: file.modifiedAt,
    modifiedLabel,
    ownerId: file.ownerId,
    ownerName: mine ? OWN_FILE_OWNER : ownerFullName,
    ownerFullName,
    ownerSeed: userColorSeed(file.ownerId),
    mine,
    starred: file.starred,
    starLabel: `${file.starred ? 'Unstar' : 'Star'} ${file.name}`,
    source,
    teamId: file.teamId,
    teamName: file.teamId ? (context.lookup.teamName(file.teamId) ?? '') : '',
    conversationId: file.source.type === 'message' ? file.source.conversationId : null,
    previewUrl: file.previewUrl,
    canManage: !context.isGuest && (mine || context.isAdmin),
    typeLine: typeLineOf(typeLabel, file.extension, file.starred),
    gridMeta: [typeLabel, file.sizeLabel, source.label].join(SEPARATOR),
    listMeta: [typeLabel, file.sizeLabel, modifiedLabel].join(SEPARATOR),
    openLabel: `Preview ${file.name}, ${typeLabel}, ${file.sizeLabel}, ${source.label}, modified ${modifiedLabel}`,
    menuLabel: `More actions for ${file.name}`,
  };
};

const menuItem = (kind: FileActionKind, label: string, icon: IconName): FileMenuItem => ({
  kind,
  label,
  icon,
  danger: kind === 'remove',
});

export const fileMenuItems = (row: FileRow): readonly FileMenuItem[] => [
  menuItem('preview', 'Preview', 'eye'),
  menuItem('download', 'Download', 'download'),
  menuItem('star', row.starred ? 'Unstar' : 'Star', 'star'),
  menuItem('copy-link', 'Copy link', 'link'),
  ...(row.source.link ? [menuItem('source', 'View source', row.source.icon)] : []),
  ...(row.canManage
    ? [menuItem('rename', 'Rename', 'pencil'), menuItem('remove', 'Delete', 'trash-2')]
    : []),
];

const FOLDER_MATCHERS: Record<FileView, (row: FileRow) => boolean> = {
  recent: () => true,
  shared: (row) => !row.mine && row.source.kind !== 'upload',
  mine: (row) => row.mine,
  starred: (row) => row.starred,
};

export const inFolder = (rows: readonly FileRow[], folder: FileView): readonly FileRow[] =>
  rows.filter(FOLDER_MATCHERS[folder]);

export const countByFolder = (rows: readonly FileRow[]): Record<FileView, number> =>
  Object.fromEntries(
    FILE_FOLDERS.map((folder) => [folder.id, inFolder(rows, folder.id).length]),
  ) as Record<FileView, number>;

export const pageOf = <Row>(
  rows: readonly Row[],
  page: number,
  pageSize: number,
): readonly Row[] => {
  const lastPage = Math.max(Math.ceil(rows.length / pageSize), 1);
  const start = (Math.min(Math.max(page, 1), lastPage) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
};

const uploadCopy = (icon: IconName, heading: string, message: string): EmptyCopy => ({
  icon,
  heading,
  message,
  actionLabel: 'Upload a file',
  actionIcon: 'upload',
  action: 'upload',
});

const plainCopy = (icon: IconName, heading: string, message: string): EmptyCopy => ({
  icon,
  heading,
  message,
  actionLabel: '',
  actionIcon: 'upload',
  action: null,
});

const FOLDER_EMPTY_COPY: Record<FileView, EmptyCopy> = {
  recent: uploadCopy(
    'folder-open',
    'No files yet',
    'Upload a file or share one in a conversation to see it here.',
  ),
  shared: plainCopy(
    'share-2',
    'Nothing shared yet',
    'Files teammates attach to messages and tasks will appear here.',
  ),
  mine: uploadCopy(
    'upload',
    'No files yet',
    'Upload your first file to keep it with your team’s work.',
  ),
  starred: plainCopy('star', 'No starred files', 'Star important files to find them quickly.'),
};

const NO_MATCH_COPY: EmptyCopy = {
  icon: 'search',
  heading: 'No results',
  message: 'Try changing your search or filters.',
  actionLabel: 'Clear all',
  actionIcon: 'x',
  action: 'clear',
};

export const emptyCopyFor = (folder: FileView, filtered: boolean): EmptyCopy =>
  filtered ? NO_MATCH_COPY : FOLDER_EMPTY_COPY[folder];
