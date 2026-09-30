import { Attachment, Message, Reaction } from '../models/message';
import { minutesAgo } from './mock-clock';
import { CURRENT_USER_ID } from './users.mock';

export interface MessageSeed {
  readonly authorId: string;
  readonly minutesAgo: number;
  readonly text: string;
  readonly attachments?: readonly Attachment[];
  readonly reactions?: readonly Reaction[];
  readonly replyToIndex?: number;
  readonly pinned?: boolean;
}

const messageId = (conversationId: string, index: number): string => `${conversationId}-${index}`;

const hasLaterReply = (seeds: readonly MessageSeed[], index: number): boolean =>
  seeds.slice(index + 1).some((seed) => seed.authorId !== CURRENT_USER_ID);

const deliveryStateOf = (
  seeds: readonly MessageSeed[],
  index: number,
): Message['deliveryState'] => {
  if (seeds[index].authorId !== CURRENT_USER_ID) {
    return 'sent';
  }
  return hasLaterReply(seeds, index) ? 'read' : 'delivered';
};

export const messagesFromSeeds = (
  conversationId: string,
  seeds: readonly MessageSeed[],
): Message[] =>
  seeds.map((seed, index) => ({
    id: messageId(conversationId, index),
    conversationId,
    authorId: seed.authorId,
    text: seed.text,
    sentAt: minutesAgo(seed.minutesAgo),
    attachments: seed.attachments ?? [],
    reactions: seed.reactions ?? [],
    replyToId:
      seed.replyToIndex === undefined ? null : messageId(conversationId, seed.replyToIndex),
    pinned: seed.pinned ?? false,
    deliveryState: deliveryStateOf(seeds, index),
  }));
