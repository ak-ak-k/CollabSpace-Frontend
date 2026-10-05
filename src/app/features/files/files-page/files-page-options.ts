import { FileView } from '../../../core/models/file-item';
import { Team } from '../../../core/models/team';
import { firstNameOf, User } from '../../../core/models/user';
import { SelectOption } from '../../../shared/ui/select/select.component';
import { TabItem } from '../../../shared/ui/tabs/tabs.component';
import { FILE_FOLDERS } from '../files-options';
import { FileRow } from '../files-view';

const OWN_FILE_OWNER = 'You';

export const folderTabs = (counts: Readonly<Record<FileView, number>> | null): TabItem[] =>
  FILE_FOLDERS.map((folder) => ({
    id: folder.id,
    label: folder.short,
    count: counts?.[folder.id],
    link: ['/files', folder.id],
  }));

export const teamOptionsOf = (teams: readonly Team[]): SelectOption[] => [
  { value: '', label: 'All teams' },
  ...teams.map((team) => ({ value: team.id, label: team.name })),
];

export const ownerOptionsOf = (rows: readonly FileRow[]): SelectOption[] => {
  const owners = new Map<string, string>();
  rows.forEach((row) => owners.set(row.ownerId, row.mine ? OWN_FILE_OWNER : row.ownerFullName));
  return [
    { value: '', label: 'Anyone' },
    ...[...owners].map(([value, label]) => ({ value, label })),
  ];
};

export const ownerChipName = (
  ownerId: string,
  currentUserId: string,
  owner: User | null,
): string => (ownerId === currentUserId ? OWN_FILE_OWNER : firstNameOf(owner?.name ?? ownerId));

export const queryParamValue = (value: string | null | undefined): string => value ?? '';
