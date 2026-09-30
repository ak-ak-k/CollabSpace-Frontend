import { ConversationFilter, ConversationPreview } from '../../../core/models/conversation';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export interface FilterEmptyState {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
}

export const CONVERSATION_FILTERS: readonly ConversationFilter[] = [
  'all',
  'unread',
  'direct',
  'groups',
  'starred',
];

export const FILTER_LABELS: Record<ConversationFilter, string> = {
  all: 'All',
  unread: 'Unread',
  direct: 'Direct',
  groups: 'Groups',
  starred: 'Starred',
};

const COUNTED_FILTERS: ReadonlySet<ConversationFilter> = new Set(['unread', 'starred']);

export const isCountedFilter = (filter: ConversationFilter): boolean => COUNTED_FILTERS.has(filter);

export const FILTER_EMPTY_STATES: Record<ConversationFilter, FilterEmptyState> = {
  all: {
    icon: 'messages-square',
    heading: 'No conversations yet',
    message: 'Start a direct message or a group chat with your team.',
  },
  unread: {
    icon: 'check-check',
    heading: 'No unread messages',
    message: 'You’re all caught up on conversations.',
  },
  direct: {
    icon: 'user',
    heading: 'No direct messages',
    message: 'Search for a teammate to start one.',
  },
  groups: {
    icon: 'users',
    heading: 'No group chats',
    message: 'Create a group from the New group chat button.',
  },
  starred: {
    icon: 'star',
    heading: 'Nothing starred yet',
    message: 'Star a conversation from its header to pin it here.',
  },
};

export const searchEmptyState = (query: string): FilterEmptyState => ({
  icon: 'search',
  heading: 'No matches',
  message: `No conversations match “${query}”.`,
});

export const matchesFilter = (preview: ConversationPreview, filter: ConversationFilter): boolean =>
  filter === 'all' ||
  (filter === 'unread' && preview.unreadCount > 0) ||
  (filter === 'direct' && preview.type === 'dm') ||
  (filter === 'groups' && preview.type === 'group') ||
  (filter === 'starred' && preview.starred);

export const matchesQuery = (preview: ConversationPreview, query: string): boolean =>
  query === '' ||
  preview.title.toLowerCase().includes(query) ||
  preview.preview.toLowerCase().includes(query);
