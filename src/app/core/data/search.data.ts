import { inject, Service } from '@angular/core';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_FILES } from '../mocks/files.mock';
import { MOCK_TASKS } from '../mocks/tasks.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { FILE_TYPE_LABELS } from '../models/file-item';
import { canSeeFile, sourceLabelOf } from '../models/file-source';
import { PresenceStatus } from '../models/user';
import type { SearchFilter } from '../services/search.service';
import { MockRequest } from './mock-request';
import {
  canSeeChannel,
  canSeeConversation,
  canSeeTeam,
  conversationOf,
  FILE_ACCESS,
  FILE_LOOKUP,
  SEARCHABLE_MESSAGES,
  teamOf,
  userNameOf,
} from './search-context';
import { toChannel, toFile, toMessage, toPerson, toTask, toTeam } from './search-results';

export { highlight } from './search-results';

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

export interface SearchScope {
  readonly workspaceId: string;
  readonly memberIds: ReadonlySet<string>;
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

type Finder = (needle: string) => readonly SearchResult[];

const RANKED_GROUPS: ReadonlySet<SearchGroupKey> = new Set([
  'people',
  'channels',
  'teams',
  'tasks',
  'files',
]);

const otherUsers = MOCK_USERS.filter((user) => user.id !== CURRENT_USER_ID);
const teamWorkspaces = new Map(MOCK_TEAMS.map((team) => [team.id, team.workspaceId]));

const workspaceOfConversation = (conversationId: string): string | undefined => {
  const conversation = conversationOf(conversationId);
  if (conversation?.type === 'channel') {
    return teamWorkspaces.get(conversation.teamId);
  }
  return conversation?.workspaceId;
};

const hiddenByTeam = (teamId: string | null): boolean => {
  const team = teamOf(teamId);
  return !!team?.isPrivate && !team.memberIds.includes(CURRENT_USER_ID);
};

export const rankOf = (result: SearchResult, needle: string): number => {
  const { before, match, after } = result.title;
  const text = `${before}${match}${after}`.toLowerCase();
  if (text === needle) {
    return 0;
  }
  if (text.startsWith(needle)) {
    return 1;
  }
  return match ? 2 : 3;
};

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

const findersFor = (scope?: SearchScope): Record<SearchGroupKey, Finder> => {
  const inScope = (workspaceId: string | undefined) => !scope || workspaceId === scope.workspaceId;
  return {
    people: finder(
      otherUsers.filter((user) => !scope || scope.memberIds.has(user.id)),
      (user) => [user.name, user.title, user.email, user.department],
      toPerson,
    ),
    messages: finder(
      SEARCHABLE_MESSAGES.filter(
        (message) =>
          inScope(workspaceOfConversation(message.conversationId)) &&
          canSeeConversation(conversationOf(message.conversationId)),
      ),
      (message) => [message.text],
      toMessage,
    ),
    channels: finder(
      MOCK_CHANNELS.filter(
        (channel) => inScope(teamWorkspaces.get(channel.teamId)) && canSeeChannel(channel),
      ),
      (channel) => [channel.name, channel.description, teamOf(channel.teamId)?.name ?? ''],
      toChannel,
    ),
    teams: finder(
      MOCK_TEAMS.filter((team) => inScope(team.workspaceId) && canSeeTeam(team)),
      (team) => [team.name, team.description],
      toTeam,
    ),
    tasks: finder(
      MOCK_TASKS.filter((task) => inScope(task.workspaceId) && !hiddenByTeam(task.teamId)),
      (task) => [
        task.title,
        task.id,
        task.description,
        userNameOf(task.assigneeId),
        teamOf(task.teamId)?.name ?? '',
        ...task.labels,
      ],
      toTask,
    ),
    files: finder(
      MOCK_FILES.filter((file) => inScope(file.workspaceId) && canSeeFile(file, FILE_ACCESS)),
      (file) => [
        file.name,
        FILE_TYPE_LABELS[file.type],
        userNameOf(file.ownerId),
        sourceLabelOf(file, FILE_LOOKUP),
        teamOf(file.teamId)?.name ?? '',
      ],
      toFile,
    ),
  };
};

const ranked = (
  key: SearchGroupKey,
  found: readonly SearchResult[],
  needle: string,
): readonly SearchResult[] =>
  RANKED_GROUPS.has(key)
    ? [...found].sort((first, second) => rankOf(first, needle) - rankOf(second, needle))
    : found;

const groupsFor = (needle: string, filter: SearchFilter, scope?: SearchScope): SearchGroup[] => {
  const overview = filter === 'all';
  const limit = overview ? OVERVIEW_GROUP_LIMIT : FILTERED_GROUP_LIMIT;
  const finders = findersFor(scope);
  return SEARCH_GROUPS.filter((group) => overview || group.key === filter)
    .map((group) => ({ group, found: ranked(group.key, finders[group.key](needle), needle) }))
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

  search(
    query: string,
    filter: SearchFilter = 'all',
    scope?: SearchScope,
  ): Promise<readonly SearchGroup[]> {
    const needle = query.trim().toLowerCase();
    return needle
      ? this.request.read(() => groupsFor(needle, filter, scope), [])
      : Promise.resolve([]);
  }
}
