import { inject, Service } from '@angular/core';
import { formatWhen } from '../../shared/pipes/time-format';
import { presenceLabelOf } from '../../shared/pipes/presence-label';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_CONVERSATIONS } from '../mocks/conversations.mock';
import { MOCK_FILES } from '../mocks/files.mock';
import { buildMockMessages } from '../mocks/messages.mock';
import { MOCK_TASKS } from '../mocks/tasks.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS, FileItem } from '../models/file-item';
import { Message } from '../models/message';
import { Task, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../models/task';
import { Team } from '../models/team';
import { firstNameOf, PresenceStatus, User, userColorSeed } from '../models/user';
import type { SearchFilter } from '../services/search.service';
import { MockRequest } from './mock-request';

export type SearchGroupKey = Exclude<SearchFilter, 'all'>;

export interface SearchHighlight {
  readonly before: string;
  readonly match: string;
  readonly after: string;
}

export interface SearchTarget {
  readonly path: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

interface SearchResultBase {
  readonly id: string;
  readonly title: SearchHighlight;
  readonly subtitle: string;
  readonly target: SearchTarget;
}

export interface PersonSearchResult extends SearchResultBase {
  readonly kind: 'person';
  readonly name: string;
  readonly colorSeed: number;
  readonly status: PresenceStatus;
}

export interface TeamSearchResult extends SearchResultBase {
  readonly kind: 'team';
  readonly name: string;
  readonly code: string;
}

export interface IconSearchResult extends SearchResultBase {
  readonly kind: 'message' | 'channel' | 'task' | 'file';
  readonly icon: IconName;
}

export type SearchResult = PersonSearchResult | TeamSearchResult | IconSearchResult;

export interface SearchGroupDefinition {
  readonly key: SearchGroupKey;
  readonly label: string;
  readonly icon: IconName;
}

export interface SearchGroup extends SearchGroupDefinition {
  readonly total: number;
  readonly items: readonly SearchResult[];
  readonly hasMore: boolean;
}

export const SEARCH_GROUPS: readonly SearchGroupDefinition[] = [
  { key: 'people', label: 'People', icon: 'user' },
  { key: 'messages', label: 'Messages', icon: 'message-square' },
  { key: 'channels', label: 'Channels', icon: 'hash' },
  { key: 'teams', label: 'Teams', icon: 'users' },
  { key: 'tasks', label: 'Tasks', icon: 'square-kanban' },
  { key: 'files', label: 'Files', icon: 'file' },
];

export const OVERVIEW_GROUP_LIMIT = 4;
export const FILTERED_GROUP_LIMIT = 30;

const SNIPPET_LEAD_LENGTH = 36;
const SNIPPET_TAIL_LENGTH = 70;
const SEPARATOR = ' · ';
const ELLIPSIS = '…';
const TASK_TITLE_GAP = '  ';
const OWN_FILE_OWNER = 'You';

type Finder = (needle: string) => readonly SearchResult[];

const usersById = new Map(MOCK_USERS.map((user) => [user.id, user]));
const teamsById = new Map(MOCK_TEAMS.map((team) => [team.id, team]));
const otherUsers = MOCK_USERS.filter((user) => user.id !== CURRENT_USER_ID);
const newestMessages = Object.values(buildMockMessages())
  .flat()
  .sort((first, second) => second.sentAt - first.sentAt);

const nameOf = (userId: string | null): string => usersById.get(userId ?? '')?.name ?? '';

const joined = (parts: readonly string[]): string => parts.filter(Boolean).join(SEPARATOR);

export const highlight = (text: string, needle: string): SearchHighlight => {
  const start = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (start < 0) {
    return { before: text, match: '', after: '' };
  }
  const end = start + needle.length;
  return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
};

const channelPath = (channel: Channel): string => `/teams/${channel.teamId}/c/${channel.id}`;

const placeOf = (conversationId: string): { title: string; path: string } => {
  const channel = MOCK_CHANNELS.find((candidate) => candidate.id === conversationId);
  if (channel) {
    return { title: `#${channel.name}`, path: channelPath(channel) };
  }
  const conversation = MOCK_CONVERSATIONS.find((candidate) => candidate.id === conversationId);
  const title = conversation?.type === 'dm' ? nameOf(conversation.userId) : conversation?.name;
  return { title: title ?? '', path: `/messages/${conversationId}` };
};

const snippetOf = (text: string, needle: string): string => {
  const matchStart = text.toLowerCase().indexOf(needle);
  const start = Math.max(0, matchStart - SNIPPET_LEAD_LENGTH);
  const snippet = text.slice(start, matchStart + needle.length + SNIPPET_TAIL_LENGTH);
  return start > 0 ? `${ELLIPSIS}${snippet}` : snippet;
};

const toPerson = (user: User, needle: string): SearchResult => ({
  kind: 'person',
  id: user.id,
  name: user.name,
  colorSeed: userColorSeed(user.id),
  status: user.status,
  title: highlight(user.name, needle),
  subtitle: joined([user.title, presenceLabelOf(user)]),
  target: { path: `/messages/dm-${user.id}` },
});

const toMessage = (message: Message, needle: string): SearchResult => {
  const place = placeOf(message.conversationId);
  const author = firstNameOf(nameOf(message.authorId));
  return {
    kind: 'message',
    id: message.id,
    icon: 'message-square',
    title: highlight(snippetOf(message.text, needle), needle),
    subtitle: joined([`${author} in ${place.title}`, formatWhen(message.sentAt)]),
    target: { path: place.path },
  };
};

const toChannel = (channel: Channel, needle: string): SearchResult => ({
  kind: 'channel',
  id: channel.id,
  icon: channel.isPrivate ? 'lock' : 'hash',
  title: highlight(channel.name, needle),
  subtitle: joined([teamsById.get(channel.teamId)?.name ?? '', channel.description]),
  target: { path: channelPath(channel) },
});

const toTeam = (team: Team, needle: string): SearchResult => ({
  kind: 'team',
  id: team.id,
  name: team.name,
  code: team.code,
  title: highlight(team.name, needle),
  subtitle: joined([`${team.memberIds.length} members`, team.description]),
  target: { path: `/teams/${team.id}` },
});

const toTask = (task: Task, needle: string): SearchResult => ({
  kind: 'task',
  id: task.id,
  icon: 'square-kanban',
  title: highlight(`${task.id}${TASK_TITLE_GAP}${task.title}`, needle),
  subtitle: joined([
    TASK_STATUS_LABELS[task.status],
    `${TASK_PRIORITY_LABELS[task.priority]} priority`,
    nameOf(task.assigneeId),
  ]),
  target: { path: '/tasks', queryParams: { task: task.id } },
});

const toFile = (file: FileItem, needle: string): SearchResult => ({
  kind: 'file',
  id: file.id,
  icon: FILE_TYPE_ICONS[file.type],
  title: highlight(file.name, needle),
  subtitle: joined([
    FILE_TYPE_LABELS[file.type],
    file.sizeLabel,
    file.ownerId === CURRENT_USER_ID ? OWN_FILE_OWNER : nameOf(file.ownerId),
    formatWhen(file.modifiedAt),
  ]),
  target: { path: '/files' },
});

const finder =
  <Item>(
    items: readonly Item[],
    fieldsOf: (item: Item) => readonly string[],
    toResult: (item: Item, needle: string) => SearchResult,
  ): Finder =>
  (needle) =>
    items
      .filter((item) => fieldsOf(item).some((field) => field.toLowerCase().includes(needle)))
      .map((item) => toResult(item, needle));

const FINDERS: Record<SearchGroupKey, Finder> = {
  people: finder(otherUsers, (user) => [user.name, user.title, user.email], toPerson),
  messages: finder(newestMessages, (message) => [message.text], toMessage),
  channels: finder(MOCK_CHANNELS, (channel) => [channel.name, channel.description], toChannel),
  teams: finder(MOCK_TEAMS, (team) => [team.name, team.description], toTeam),
  tasks: finder(MOCK_TASKS, (task) => [task.title, task.id], toTask),
  files: finder(MOCK_FILES, (file) => [file.name], toFile),
};

const groupsFor = (needle: string, filter: SearchFilter): SearchGroup[] => {
  const overview = filter === 'all';
  const limit = overview ? OVERVIEW_GROUP_LIMIT : FILTERED_GROUP_LIMIT;
  return SEARCH_GROUPS.filter((group) => overview || group.key === filter)
    .map((group) => ({ group, found: FINDERS[group.key](needle) }))
    .filter(({ found }) => found.length > 0)
    .map(({ group, found }) => ({
      ...group,
      total: found.length,
      items: found.slice(0, limit),
      hasMore: overview && found.length > limit,
    }));
};

@Service()
export class SearchData {
  private readonly request = inject(MockRequest);

  search(query: string, filter: SearchFilter = 'all'): Promise<readonly SearchGroup[]> {
    const needle = query.trim().toLowerCase();
    return needle ? this.request.read(() => groupsFor(needle, filter), []) : Promise.resolve([]);
  }
}
