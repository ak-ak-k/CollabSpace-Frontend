import { FILE_TYPE_LABELS, FileType, FileView } from '../../core/models/file-item';
import {
  FILE_SOURCE_LABELS,
  FileModifiedFilter,
  FileSort,
  FileSortKey,
  FileSourceFilter,
} from './files-options';
import { FileRow, inFolder } from './files-view';

export interface FileFilterState {
  readonly types: readonly FileType[];
  readonly ownerId: string;
  readonly source: FileSourceFilter;
  readonly modified: FileModifiedFilter;
}

export interface FileScope {
  readonly teamId: string;
  readonly conversationId: string;
  readonly teamChannelIds: ReadonlySet<string>;
}

export interface FileQuery {
  readonly folder: FileView;
  readonly search: string;
  readonly filters: FileFilterState;
  readonly scope: FileScope;
  readonly now: number;
}

export type FileChipRemoval =
  | { readonly kind: 'team' | 'conversation' | 'owner' | 'source' | 'modified' }
  | { readonly kind: 'type'; readonly type: FileType };

export interface FileFilterChip {
  readonly key: string;
  readonly label: string;
  readonly removeLabel: string;
  readonly removal: FileChipRemoval;
}

export interface FileChipNames {
  readonly teamName: string;
  readonly conversationTitle: string;
  readonly ownerName: string;
}

export const NO_FILE_FILTERS: FileFilterState = {
  types: [],
  ownerId: '',
  source: 'any',
  modified: 'any',
};

const MILLISECONDS_PER_DAY = 86_400_000;
const MODIFIED_WINDOW_DAYS: Record<Exclude<FileModifiedFilter, 'any'>, number> = {
  7: 7,
  30: 30,
};

const isRecentEnough = (row: FileRow, modified: FileModifiedFilter, now: number): boolean =>
  modified === 'any' ||
  now - row.modifiedAt < MODIFIED_WINDOW_DAYS[modified] * MILLISECONDS_PER_DAY;

const matchesFilters = (row: FileRow, filters: FileFilterState, now: number): boolean =>
  (filters.types.length === 0 || filters.types.includes(row.type)) &&
  (!filters.ownerId || row.ownerId === filters.ownerId) &&
  (filters.source === 'any' || row.source.kind === filters.source) &&
  isRecentEnough(row, filters.modified, now);

const matchesScope = (row: FileRow, scope: FileScope): boolean =>
  (!scope.teamId ||
    row.teamId === scope.teamId ||
    (row.conversationId !== null && scope.teamChannelIds.has(row.conversationId))) &&
  (!scope.conversationId || row.conversationId === scope.conversationId);

const matchesSearch = (row: FileRow, search: string): boolean =>
  !search ||
  [
    row.name,
    row.extension,
    row.typeLabel,
    row.ownerName,
    row.ownerFullName,
    row.source.label,
    row.teamName,
  ].some((text) => text.toLowerCase().includes(search));

export const filterRows = (rows: readonly FileRow[], query: FileQuery): readonly FileRow[] => {
  const search = query.search.trim().toLowerCase();
  return inFolder(rows, query.folder).filter(
    (row) =>
      matchesFilters(row, query.filters, query.now) &&
      matchesScope(row, query.scope) &&
      matchesSearch(row, search),
  );
};

export const activeFilterCount = (filters: FileFilterState, scope: FileScope): number =>
  filters.types.length +
  [
    filters.ownerId,
    filters.source !== 'any',
    filters.modified !== 'any',
    scope.teamId,
    scope.conversationId,
  ].filter(Boolean).length;

export const toggleType = (filters: FileFilterState, type: FileType): FileFilterState => ({
  ...filters,
  types: filters.types.includes(type)
    ? filters.types.filter((current) => current !== type)
    : [...filters.types, type],
});

export const withoutChip = (
  filters: FileFilterState,
  removal: FileChipRemoval,
): FileFilterState => {
  switch (removal.kind) {
    case 'type':
      return { ...filters, types: filters.types.filter((type) => type !== removal.type) };
    case 'owner':
      return { ...filters, ownerId: '' };
    case 'source':
      return { ...filters, source: 'any' };
    case 'modified':
      return { ...filters, modified: 'any' };
    default:
      return filters;
  }
};

const chip = (key: string, label: string, removal: FileChipRemoval): FileFilterChip => ({
  key,
  label,
  removeLabel: `Remove filter ${label}`,
  removal,
});

export const filterChips = (
  filters: FileFilterState,
  scope: FileScope,
  names: FileChipNames,
): readonly FileFilterChip[] => [
  ...(scope.teamId ? [chip('team', `Team: ${names.teamName}`, { kind: 'team' })] : []),
  ...(scope.conversationId
    ? [chip('conversation', `Shared in: ${names.conversationTitle}`, { kind: 'conversation' })]
    : []),
  ...filters.types.map((type) =>
    chip(`type-${type}`, `Type: ${FILE_TYPE_LABELS[type]}`, { kind: 'type', type }),
  ),
  ...(filters.ownerId ? [chip('owner', `Uploaded by: ${names.ownerName}`, { kind: 'owner' })] : []),
  ...(filters.source !== 'any'
    ? [chip('source', `Source: ${FILE_SOURCE_LABELS[filters.source]}`, { kind: 'source' })]
    : []),
  ...(filters.modified !== 'any'
    ? [chip('modified', `Modified: last ${filters.modified} days`, { kind: 'modified' })]
    : []),
];

const COMPARATORS: Record<FileSortKey, (first: FileRow, second: FileRow) => number> = {
  name: (first, second) => first.name.localeCompare(second.name),
  size: (first, second) => first.bytes - second.bytes,
  modified: (first, second) => first.modifiedAt - second.modifiedAt,
};

export const sortRows = (rows: readonly FileRow[], sort: FileSort): readonly FileRow[] => {
  const direction = sort.direction === 'asc' ? 1 : -1;
  const compare = COMPARATORS[sort.key];
  return [...rows].sort((first, second) => compare(first, second) * direction);
};
