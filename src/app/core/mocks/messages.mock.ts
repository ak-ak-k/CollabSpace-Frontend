import { Message } from '../models/message';
import { messagesFromSeeds, MessageSeed } from './message-seed';
import { MOCK_CHANNEL_MESSAGE_SEEDS } from './messages-channel.mock';
import { MOCK_DIRECT_MESSAGE_SEEDS } from './messages-direct.mock';
import { MOCK_GROUP_MESSAGE_SEEDS } from './messages-group.mock';
import { buildExtraMessages } from './messages-threads.mock';

const ALL_SEEDS: Readonly<Record<string, readonly MessageSeed[]>> = {
  ...MOCK_DIRECT_MESSAGE_SEEDS,
  ...MOCK_GROUP_MESSAGE_SEEDS,
  ...MOCK_CHANNEL_MESSAGE_SEEDS,
};

const byTime = (first: Message, second: Message): number => first.sentAt - second.sentAt;

export const buildMockMessages = (): Record<string, Message[]> => {
  const extras = buildExtraMessages();
  return Object.fromEntries(
    Object.entries(ALL_SEEDS).map(([conversationId, seeds]) => [
      conversationId,
      [...messagesFromSeeds(conversationId, seeds), ...(extras[conversationId] ?? [])].sort(byTime),
    ]),
  );
};
