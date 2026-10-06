import { LoadStatus } from '../../core/models/load-status';
import {
  firstNameOf,
  PRESENCE_LABELS,
  PresenceStatus,
  User,
  userColorSeed,
  WorkspaceRole,
} from '../../core/models/user';
import { isWorkspaceManager, WORKSPACE_ROLE_LABELS } from '../../core/models/workspace-role';
import { relativePhrase } from '../../core/state/person-status';
import { formatCount } from '../../shared/pipes/count.pipe';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { TagTone } from '../../shared/ui/tag/tag.component';
import { WORKSPACE_ROUTE } from './workspace-actions.service';

export type PeopleFilter = 'all' | 'online' | 'admins' | 'members' | 'guests';
export type MemberFilter = PeopleFilter | 'invited';

export interface MemberRow {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly firstName: string;
  readonly email: string;
  readonly title: string;
  readonly department: string;
  readonly seed: number;
  readonly status: PresenceStatus;
  readonly statusLabel: string;
  readonly role: WorkspaceRole;
  readonly roleLabel: string;
  readonly roleTone: TagTone;
  readonly activeLabel: string;
  readonly isMe: boolean;
}

export interface MemberFilterChip {
  readonly filter: MemberFilter;
  readonly label: string;
  readonly link: string;
  readonly count: number;
}

export interface MembersEmptyView {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
}

export const MEMBERS_ROUTE = `${WORKSPACE_ROUTE}/members`;
export const MANAGE_INVITATIONS_ROUTE = `${WORKSPACE_ROUTE}/settings/members`;

const PEOPLE_FILTER_LABELS: Record<PeopleFilter, string> = {
  all: 'All',
  online: 'Online',
  admins: 'Admins',
  members: 'Members',
  guests: 'Guests',
};

const PEOPLE_FILTERS = Object.keys(PEOPLE_FILTER_LABELS) as PeopleFilter[];
const INVITED_LABEL = 'Invited';

export const MEMBER_FILTERS: readonly MemberFilter[] = [...PEOPLE_FILTERS, 'invited'];

const FILTER_MATCHERS: Record<PeopleFilter, (user: User) => boolean> = {
  all: () => true,
  online: (user) => user.status === 'online',
  admins: (user) => isWorkspaceManager(user.role),
  members: (user) => user.role === 'member',
  guests: (user) => user.role === 'guest',
};

const ROLE_TAG_TONES: Record<WorkspaceRole, TagTone> = {
  owner: 'outline',
  admin: 'outline',
  member: 'neutral',
  guest: 'subtle',
};

export const workspacePeople = (
  members: readonly User[],
  currentUser: User | null,
  loadStatus: LoadStatus,
): readonly User[] => {
  if (loadStatus !== 'empty') {
    return members;
  }
  return currentUser ? [currentUser] : [];
};

export const memberFilterOf = (value: string | undefined): MemberFilter =>
  MEMBER_FILTERS.find((filter) => filter === value) ?? 'all';

export const memberFilterLink = (filter: MemberFilter): string =>
  filter === 'all' ? MEMBERS_ROUTE : `${MEMBERS_ROUTE}/${filter}`;

export const memberFilterChips = (
  people: readonly User[],
  invitedCount?: number,
): readonly MemberFilterChip[] => {
  const chips = PEOPLE_FILTERS.map((filter) => ({
    filter,
    label: PEOPLE_FILTER_LABELS[filter],
    link: memberFilterLink(filter),
    count: people.filter(FILTER_MATCHERS[filter]).length,
  }));
  if (invitedCount === undefined) {
    return chips;
  }
  const invited: MemberFilterChip = {
    filter: 'invited',
    label: INVITED_LABEL,
    link: memberFilterLink('invited'),
    count: invitedCount,
  };
  return [...chips, invited];
};

export const allowedMemberFilter = (filter: MemberFilter, canInvite: boolean): MemberFilter =>
  filter === 'invited' && !canInvite ? 'all' : filter;

const matchesQuery = (user: User, query: string): boolean =>
  !query ||
  [user.name, user.email, user.title, user.department].some((field) =>
    field.toLowerCase().includes(query),
  );

export const visibleMembers = (
  people: readonly User[],
  filter: PeopleFilter,
  query: string,
): readonly User[] => {
  const normalized = query.trim().toLowerCase();
  return people
    .filter((user) => FILTER_MATCHERS[filter](user) && matchesQuery(user, normalized))
    .sort((first, second) => first.name.localeCompare(second.name));
};

export const activeLabelOf = (user: User, now = Date.now()): string => {
  if (user.status === 'online' || user.status === 'dnd') {
    return 'Active now';
  }
  if (user.status === 'away') {
    return user.lastActiveAt ? `Active ${relativePhrase(user.lastActiveAt, now)}` : 'Away';
  }
  return user.lastSeenAt ? `Active ${relativePhrase(user.lastSeenAt, now)}` : 'Not active yet';
};

export const memberRowOf = (user: User, viewerId: string, now = Date.now()): MemberRow => {
  const isMe = user.id === viewerId;
  return {
    id: user.id,
    name: user.name,
    label: isMe ? `${user.name} (you)` : user.name,
    firstName: firstNameOf(user.name),
    email: user.email,
    title: user.title,
    department: user.department,
    seed: userColorSeed(user.id),
    status: user.status,
    statusLabel: PRESENCE_LABELS[user.status],
    role: user.role,
    roleLabel: WORKSPACE_ROLE_LABELS[user.role],
    roleTone: ROLE_TAG_TONES[user.role],
    activeLabel: activeLabelOf(user, now),
    isMe,
  };
};

export const noMatchingMembers = (
  filter: PeopleFilter,
  query: string,
  workspaceName: string,
): MembersEmptyView => {
  const trimmed = query.trim();
  if (trimmed || filter === 'all') {
    return {
      icon: 'search',
      heading: 'No members match',
      message: `Nobody matches “${trimmed}”. Try a name, email or job title.`,
    };
  }
  const views: Record<Exclude<PeopleFilter, 'all'>, MembersEmptyView> = {
    online: {
      icon: 'activity',
      heading: 'No one is online',
      message: `Nobody else in ${workspaceName} is online right now.`,
    },
    admins: {
      icon: 'shield-check',
      heading: 'No admins found',
      message: 'No owners or admins match.',
    },
    members: {
      icon: 'users',
      heading: 'No members found',
      message: 'No members match this filter.',
    },
    guests: { icon: 'user', heading: 'No guests', message: `${workspaceName} has no guests.` },
  };
  return views[filter];
};

export const showingLabel = (shown: number, total: number): string =>
  `Showing ${shown} of ${formatCount(total, 'member')}`;
