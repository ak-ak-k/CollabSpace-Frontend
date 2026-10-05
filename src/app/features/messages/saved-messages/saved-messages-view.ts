import { Conversation, messageRoute, threadRoute } from '../../../core/models/conversation';
import { SavedMessage } from '../../../core/models/message';
import { User, userColorSeed } from '../../../core/models/user';
import { formatRelative, formatWhen } from '../../../shared/pipes/time-format';

export interface SavedRow {
  readonly id: string;
  readonly authorName: string;
  readonly authorSeed: number;
  readonly where: string;
  readonly when: string;
  readonly text: string;
  readonly link: string;
  readonly linkLabel: string;
  readonly removeLabel: string;
  readonly savedWhen: string;
}

const REMOVE_LABEL_TEXT_LENGTH = 48;

const placeOf = (conversation: Conversation, usersById: ReadonlyMap<string, User>): string => {
  if (conversation.type === 'dm') {
    return `your DM with ${usersById.get(conversation.userId)?.name ?? 'someone'}`;
  }
  return conversation.type === 'channel' ? `#${conversation.name}` : conversation.name;
};

export const savedRowOf = (
  { message, savedAt }: SavedMessage,
  conversation: Conversation,
  usersById: ReadonlyMap<string, User>,
): SavedRow => {
  const rootId = message.threadRootId;
  const text = message.text || (message.attachments[0]?.name ?? '');
  return {
    id: message.id,
    authorName: usersById.get(message.authorId)?.name ?? 'Someone',
    authorSeed: userColorSeed(message.authorId),
    where: placeOf(conversation, usersById) + (rootId ? ' (thread)' : ''),
    when: formatWhen(message.sentAt),
    text,
    link: rootId ? threadRoute(conversation, rootId) : messageRoute(conversation, message.id),
    linkLabel: rootId ? 'Open thread' : 'Jump to message',
    removeLabel: `Remove from saved: ${(text || 'message').slice(0, REMOVE_LABEL_TEXT_LENGTH)}`,
    savedWhen: formatRelative(savedAt).toLowerCase(),
  };
};

export const savedCountLabel = (count: number): string =>
  count === 0 ? '' : `${count} ${count === 1 ? 'message' : 'messages'}.`;
