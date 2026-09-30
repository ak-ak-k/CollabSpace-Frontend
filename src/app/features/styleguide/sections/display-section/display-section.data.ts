import { BreadcrumbItem } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { CardElevation } from '../../../../shared/ui/card/card.component';
import { EmptyStateKind } from '../../../../shared/ui/empty-state/empty-state.component';
import { SkeletonLayout } from '../../../../shared/ui/skeleton/skeleton-layouts';
import { SortDirection } from '../../../../shared/ui/table/sort-header.component';
import { TabItem } from '../../../../shared/ui/tabs/tabs.component';

export type FileSortKey = 'name' | 'bytes' | 'modifiedOn';

export interface FileSort {
  readonly key: FileSortKey;
  readonly direction: SortDirection;
}

export interface SharedFile {
  readonly name: string;
  readonly type: string;
  readonly size: string;
  readonly bytes: number;
  readonly owner: string;
  readonly modified: string;
  readonly modifiedOn: number;
}

export interface TeamCard {
  readonly elevation: CardElevation;
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly meta: string;
}

export interface SkeletonExample {
  readonly layout: SkeletonLayout;
  readonly wide: boolean;
}

export interface EmptyStateExample {
  readonly kind: EmptyStateKind;
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
}

export const FILTER_TABS: readonly TabItem[] = [
  { id: 'all', label: 'All', count: 24 },
  { id: 'unread', label: 'Unread', count: 3 },
  { id: 'direct', label: 'Direct', icon: 'message-square' },
  { id: 'groups', label: 'Groups', count: 0 },
];

export const SECTION_TABS: readonly TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members', count: 12 },
  { id: 'channels', label: 'Channels', count: 6 },
  { id: 'files', label: 'Files', count: 15 },
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks', count: 31 },
  { id: 'integrations', label: 'Integrations' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'settings', label: 'Settings' },
];

export const COLUMN_TABS: readonly TabItem[] = [
  { id: 'backlog', label: 'Backlog', count: 8 },
  { id: 'todo', label: 'To do', count: 5 },
  { id: 'progress', label: 'In progress', count: 4 },
  { id: 'review', label: 'In review', count: 2 },
  { id: 'done', label: 'Done', count: 12 },
];

export const LOCATION_TABS: readonly TabItem[] = [
  { id: 'all', label: 'All files', icon: 'folder-open', count: 15, link: '/styleguide' },
  { id: 'recent', label: 'Recent', link: '/styleguide' },
  { id: 'starred', label: 'Starred', icon: 'star', count: 4, link: '/styleguide' },
  { id: 'shared', label: 'Shared with me', icon: 'users', link: '/styleguide' },
];

export const TEAM_CARDS: readonly TeamCard[] = [
  {
    elevation: 'none',
    kicker: 'Design',
    title: 'Brand refresh',
    body: 'Logo, colour and type updates for the spring launch.',
    meta: '8 members · Active today',
  },
  {
    elevation: 'sm',
    kicker: 'Engineering',
    title: 'Platform',
    body: 'Realtime messaging, presence and file sync services.',
    meta: '14 members · Active today',
  },
  {
    elevation: 'md',
    kicker: 'Marketing',
    title: 'Launch campaign',
    body: 'Landing pages, email sequences and partner outreach.',
    meta: '6 members · Active yesterday',
  },
  {
    elevation: 'lg',
    kicker: 'Support',
    title: 'Customer success',
    body: 'Onboarding guides and the weekly feedback digest.',
    meta: '5 members · Active this week',
  },
];

export const SHARED_FILES: readonly SharedFile[] = [
  file('Q3 roadmap.pdf', 'PDF', '2.4 MB', 2_400_000, 'Priya Sharma', '2 hours ago', 20260929),
  file(
    'Brand guidelines.fig',
    'Figma',
    '18.2 MB',
    18_200_000,
    'Rahul Mehta',
    'Yesterday',
    20260928,
  ),
  file('Launch checklist.xlsx', 'Spreadsheet', '86 KB', 86_000, 'You', '2 days ago', 20260927),
  file('Onboarding flow.fig', 'Figma', '9.7 MB', 9_700_000, 'Ananya Iyer', '3 days ago', 20260926),
  file('API contract.md', 'Document', '14 KB', 14_000, 'Vikram Nair', '4 days ago', 20260925),
  file('Sprint 42 demo.mp4', 'Video', '124 MB', 124_000_000, 'You', '5 days ago', 20260924),
  file('Pricing research.pdf', 'PDF', '1.1 MB', 1_100_000, 'Neha Kapoor', '6 days ago', 20260923),
  file('Homepage hero.png', 'Image', '3.6 MB', 3_600_000, 'Rahul Mehta', 'Last week', 20260921),
  file('Release notes.md', 'Document', '9 KB', 9_000, 'Priya Sharma', 'Last week', 20260920),
  file('Usage export.csv', 'Spreadsheet', '412 KB', 412_000, 'Vikram Nair', 'Last week', 20260919),
  file(
    'Investor update.pptx',
    'Slides',
    '6.3 MB',
    6_300_000,
    'Neha Kapoor',
    '2 weeks ago',
    20260915,
  ),
  file('Icon set.zip', 'Archive', '22.8 MB', 22_800_000, 'Ananya Iyer', '2 weeks ago', 20260914),
  file('Team offsite.pdf', 'PDF', '780 KB', 780_000, 'You', '3 weeks ago', 20260908),
  file('Websocket client.ts', 'Code', '21 KB', 21_000, 'Vikram Nair', '3 weeks ago', 20260906),
  file('Support macros.docx', 'Document', '64 KB', 64_000, 'Neha Kapoor', 'Last month', 20260830),
];

export const EMPTY_STATE_EXAMPLES: readonly EmptyStateExample[] = [
  {
    kind: 'empty',
    heading: 'No conversations yet',
    message: 'Say hello to your team — start a direct message or a group chat.',
    actionLabel: 'Start a conversation',
  },
  {
    kind: 'error',
    heading: 'Couldn’t load the board',
    message: 'We couldn’t reach the task service. Your changes weren’t lost.',
    actionLabel: 'Try again',
  },
  { kind: 'offline', heading: '', message: '', actionLabel: 'Try again' },
];

export const SKELETON_EXAMPLES: readonly SkeletonExample[] = [
  { layout: 'list', wide: false },
  { layout: 'table', wide: false },
  { layout: 'chat', wide: false },
  { layout: 'detail', wide: false },
  { layout: 'cards', wide: true },
  { layout: 'board', wide: true },
];

export const BREADCRUMB_ITEMS: readonly BreadcrumbItem[] = [
  { label: 'Teams', link: '/styleguide' },
  { label: 'Design', link: '/styleguide' },
  { label: 'Members' },
];

export const SETTINGS_BREADCRUMB_ITEMS: readonly BreadcrumbItem[] = [
  { label: 'All settings', link: '/styleguide' },
  { label: 'Notifications' },
];

export function sortFiles(files: readonly SharedFile[], sort: FileSort): readonly SharedFile[] {
  const orientation = sort.direction === 'asc' ? 1 : -1;
  return [...files].sort((first, second) => orientation * compareFiles(first, second, sort.key));
}

function compareFiles(first: SharedFile, second: SharedFile, key: FileSortKey): number {
  if (key === 'name') {
    return first.name.localeCompare(second.name);
  }
  return first[key] - second[key];
}

function file(
  name: string,
  type: string,
  size: string,
  bytes: number,
  owner: string,
  modified: string,
  modifiedOn: number,
): SharedFile {
  return { name, type, size, bytes, owner, modified, modifiedOn };
}
