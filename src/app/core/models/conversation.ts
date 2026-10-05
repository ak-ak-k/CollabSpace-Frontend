export type ConversationType = 'dm' | 'group' | 'channel';

export interface DirectConversation {
  readonly workspaceId: string;
  readonly id: string;
  readonly type: 'dm';
  readonly userId: string;
}

export interface GroupConversation {
  readonly workspaceId: string;
  readonly id: string;
  readonly type: 'group';
  readonly name: string;
  readonly memberIds: readonly string[];
  readonly createdBy: string;
}

export interface ChannelConversation {
  readonly id: string;
  readonly type: 'channel';
  readonly channelId: string;
  readonly teamId: string;
  readonly name: string;
  readonly memberIds: readonly string[];
}

export type Conversation = DirectConversation | GroupConversation | ChannelConversation;

export type MemberConversation = GroupConversation | ChannelConversation;

export type ConversationFilter = 'all' | 'unread' | 'direct' | 'groups' | 'channels' | 'favourites';

export type NotifyLevel = 'all' | 'mentions' | 'muted';

export const NOTIFY_LEVELS: readonly NotifyLevel[] = ['all', 'mentions', 'muted'];

export interface ConversationPreview {
  readonly id: string;
  readonly type: ConversationType;
  readonly title: string;
  readonly avatarName: string;
  readonly avatarSeed: number;
  readonly avatarStatus: 'online' | 'away' | 'dnd' | 'offline' | null;
  readonly memberCount: number;
  readonly teamName: string;
  readonly route: string;
  readonly preview: string;
  readonly lastMessageAt: number;
  readonly unreadCount: number;
  readonly starred: boolean;
  readonly muted: boolean;
  readonly typingText: string;
}

export const conversationRoute = (conversation: Conversation): string =>
  conversation.type === 'channel'
    ? `/teams/${conversation.teamId}/channels/${conversation.channelId}`
    : `/messages/${conversation.id}`;

export const messageRoute = (conversation: Conversation, messageId: string): string =>
  `${conversationRoute(conversation)}/m/${messageId}`;

export const threadPath = (conversationPath: string, rootId: string): string =>
  `${conversationPath}/thread/${rootId}`;

export const threadRoute = (conversation: Conversation, rootId: string): string =>
  threadPath(conversationRoute(conversation), rootId);
