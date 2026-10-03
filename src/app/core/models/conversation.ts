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

export type ConversationFilter = 'all' | 'unread' | 'direct' | 'groups' | 'starred';

export interface ConversationPreview {
  readonly id: string;
  readonly type: ConversationType;
  readonly title: string;
  readonly avatarName: string;
  readonly avatarSeed: number;
  readonly avatarStatus: 'online' | 'away' | 'dnd' | 'offline' | null;
  readonly memberCount: number;
  readonly preview: string;
  readonly lastMessageAt: number;
  readonly unreadCount: number;
  readonly starred: boolean;
  readonly muted: boolean;
  readonly typingText: string;
}

export const conversationRoute = (conversation: Conversation): string =>
  conversation.type === 'channel'
    ? `/teams/${conversation.teamId}/c/${conversation.channelId}`
    : `/messages/${conversation.id}`;
