import { IconName } from '../../shared/ui/icon/icon-registry';
import type { SearchFilter } from '../services/search.service';
import { PresenceStatus } from './user';

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
  readonly teamIds?: ReadonlySet<string>;
  readonly hiddenConversationIds?: ReadonlySet<string>;
}
