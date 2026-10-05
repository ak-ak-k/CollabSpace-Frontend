import { ConversationFilter, ConversationPreview } from '../../../core/models/conversation';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export interface FilterEmptyState {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
}

export interface ConversationSection {
  readonly label: string | null;
  readonly conversations: readonly ConversationPreview[];
}

export const CONVERSATION_FILTERS: readonly ConversationFilter[] = [
  'all',
  'unread',
  'direct',
  'groups',
  'channels',
  'favourites',
];

export const FILTER_LABELS: Record<ConversationFilter, string> = {
  all: 'All',
  unread: 'Unread',
  direct: 'Direct',
  groups: 'Groups',
  channels: 'Channels',
  favourites: 'Favourites',
};

const COUNTED_FILTERS: ReadonlySet<ConversationFilter> = new Set<ConversationFilter>([
  'unread',
  'favourites',
]);

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
    message: 'You’re all caught up.',
  },
  direct: {
    icon: 'user',
    heading: 'No direct messages',
    message: 'Message someone from People or ⌘K.',
  },
  groups: {
    icon: 'users',
    heading: 'No group chats',
    message: 'Create one with the New group chat button.',
  },
  channels: {
    icon: 'hash',
    heading: 'No channels',
    message: 'Join a team to see its channels here.',
  },
  favourites: {
    icon: 'star',
    heading: 'No favourites yet',
    message: 'Add a conversation to favourites from its menu to keep it at the top.',
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
  (filter === 'channels' && preview.type === 'channel') ||
  (filter === 'favourites' && preview.starred);

export const matchesQuery = (preview: ConversationPreview, query: string): boolean =>
  query === '' ||
  preview.title.toLowerCase().includes(query) ||
  preview.preview.toLowerCase().includes(query);

export const sectionsOf = (
  conversations: readonly ConversationPreview[],
  grouped: boolean,
): readonly ConversationSection[] => {
  if (!grouped) {
    return [{ label: null, conversations }];
  }
  const favourites = conversations.filter((conversation) => conversation.starred);
  const recent = conversations.filter((conversation) => !conversation.starred);
  return [
    { label: 'Favourites', conversations: favourites },
    { label: 'Recent', conversations: recent },
  ].filter((section) => section.conversations.length > 0);
};
