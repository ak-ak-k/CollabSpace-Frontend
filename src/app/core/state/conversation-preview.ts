import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Conversation, ConversationPreview, conversationRoute } from '../models/conversation';
import { Message } from '../models/message';
import { firstNameOf, User, userColorSeed } from '../models/user';
import { plainTextOf } from './chat-format';

export interface PreviewContext {
  readonly usersById: ReadonlyMap<string, User>;
  readonly messages: Readonly<Record<string, readonly Message[]>>;
  readonly unreadCounts: Readonly<Record<string, number>>;
  readonly starredIds: ReadonlySet<string>;
  readonly mutedIds: ReadonlySet<string>;
  readonly typingUserIds: Readonly<Record<string, readonly string[]>>;
  readonly teamNames: ReadonlyMap<string, string>;
}

const NO_MESSAGES = 'No messages yet';
const GROUP_SEED = 0;

type NameContext = Pick<PreviewContext, 'usersById'>;

const firstNames = (userIds: readonly string[], context: NameContext): string[] =>
  userIds.map((userId) => firstNameOf(context.usersById.get(userId)?.name ?? ''));

export const typingLabel = (userIds: readonly string[], context: NameContext): string => {
  const names = firstNames(userIds, context);
  if (names.length === 0) {
    return '';
  }
  if (names.length === 1) {
    return `${names[0]} is typing`;
  }
  return names.length === 2 ? `${names.join(' and ')} are typing` : 'Several people are typing';
};

export const typingTextOf = (userIds: readonly string[], context: NameContext): string => {
  const label = typingLabel(
    userIds.filter((userId) => userId !== CURRENT_USER_ID),
    context,
  );
  return label ? `${label}…` : '';
};

const authorPrefix = (
  conversation: Conversation,
  message: Message,
  context: PreviewContext,
): string => {
  if (message.authorId === CURRENT_USER_ID) {
    return 'You: ';
  }
  return conversation.type === 'dm' ? '' : `${firstNames([message.authorId], context)[0]}: `;
};

const previewText = (
  conversation: Conversation,
  message: Message | undefined,
  context: PreviewContext,
): string => {
  if (!message) {
    return NO_MESSAGES;
  }
  const attachment = message.attachments[0];
  const body = plainTextOf(message.text) || (attachment ? `Shared ${attachment.name}` : '');
  return authorPrefix(conversation, message, context) + body;
};

const identityOf = (
  conversation: Conversation,
  context: PreviewContext,
): Pick<ConversationPreview, 'title' | 'avatarName' | 'avatarSeed' | 'avatarStatus'> => {
  if (conversation.type === 'dm') {
    const user = context.usersById.get(conversation.userId);
    const name = user?.name ?? '';
    return {
      title: name,
      avatarName: name,
      avatarSeed: userColorSeed(conversation.userId),
      avatarStatus: user?.status ?? null,
    };
  }
  const title = conversation.type === 'channel' ? `#${conversation.name}` : conversation.name;
  return { title, avatarName: conversation.name, avatarSeed: GROUP_SEED, avatarStatus: null };
};

export const buildPreview = (
  conversation: Conversation,
  context: PreviewContext,
): ConversationPreview => {
  const thread = context.messages[conversation.id] ?? [];
  const lastMessage = thread[thread.length - 1];
  return {
    ...identityOf(conversation, context),
    id: conversation.id,
    type: conversation.type,
    memberCount: conversation.type === 'dm' ? 2 : conversation.memberIds.length,
    teamName:
      conversation.type === 'channel' ? (context.teamNames.get(conversation.teamId) ?? '') : '',
    route: conversationRoute(conversation),
    preview: previewText(conversation, lastMessage, context),
    lastMessageAt: lastMessage?.sentAt ?? 0,
    unreadCount: context.unreadCounts[conversation.id] ?? 0,
    starred: context.starredIds.has(conversation.id),
    muted: context.mutedIds.has(conversation.id),
    typingText: typingTextOf(context.typingUserIds[conversation.id] ?? [], context),
  };
};
