import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import { User } from '../models/user';

export interface ReplyPlan {
  readonly deliveryDelay: number | null;
  readonly responderId: string | null;
  readonly typingDelay: number;
  readonly replyDelay: number;
  readonly text: string;
}

export const DELIVERY_DELAY = 700;
export const TYPING_DELAY = 1100;
export const REPLY_DELAY = 2400;
export const THREAD_TYPING_DELAY = 900;
export const THREAD_REPLY_DELAY = 2200;

type ReplyPool = Readonly<Record<string, readonly string[]>>;

const RESPONSIVE_STATUSES: readonly User['status'][] = ['online', 'away'];

const recipientsOf = (conversation: Conversation, currentUserId: string): readonly string[] =>
  conversation.type === 'dm'
    ? [conversation.userId]
    : conversation.memberIds.filter((memberId) => memberId !== currentUserId);

const statusOf = (users: ReadonlyMap<string, User>, userId: string): User['status'] =>
  users.get(userId)?.status ?? 'offline';

const pickFrom = (userIds: readonly string[], index: number): string | null =>
  userIds[index % Math.max(userIds.length, 1)] ?? null;

const replyTextFor = (responderId: string | null, replies: ReplyPool, index: number): string => {
  const pool = (responderId && replies[responderId]) || replies['default'] || [];
  return pool[index % Math.max(pool.length, 1)] ?? '';
};

export const planReply = (
  conversation: Conversation,
  users: ReadonlyMap<string, User>,
  currentUserId: string,
  replies: ReplyPool,
  replyIndex: number,
): ReplyPlan => {
  const recipients = recipientsOf(conversation, currentUserId);
  const reachable = recipients.some((userId) => statusOf(users, userId) !== 'offline');
  const responsive = recipients.filter((userId) =>
    RESPONSIVE_STATUSES.includes(statusOf(users, userId)),
  );
  const responderId = pickFrom(responsive, replyIndex);
  return {
    deliveryDelay: reachable ? DELIVERY_DELAY : null,
    responderId,
    typingDelay: TYPING_DELAY,
    replyDelay: REPLY_DELAY,
    text: replyTextFor(responderId, replies, replyIndex),
  };
};

export const threadResponders = (
  messages: readonly Message[],
  rootId: string,
  users: ReadonlyMap<string, User>,
  currentUserId: string,
): readonly string[] => {
  const root = messages.find((message) => message.id === rootId);
  if (!root) {
    return [];
  }
  const replies = messages.filter((message) => message.threadRootId === rootId);
  const authors = new Set([root.authorId, ...replies.map((reply) => reply.authorId)]);
  return [...authors].filter(
    (userId) => userId !== currentUserId && RESPONSIVE_STATUSES.includes(statusOf(users, userId)),
  );
};

export const planThreadReply = (
  responders: readonly string[],
  replies: ReplyPool,
  replyIndex: number,
): ReplyPlan => {
  const responderId = pickFrom(responders, replyIndex);
  return {
    deliveryDelay: null,
    responderId,
    typingDelay: THREAD_TYPING_DELAY,
    replyDelay: THREAD_REPLY_DELAY,
    text: replyTextFor(responderId, replies, replyIndex),
  };
};

export interface ReplyEvents {
  readonly delivered: () => void;
  readonly typing: (userId: string) => void;
  readonly read: () => void;
  readonly reply: (responderId: string, text: string) => void;
}

export const scheduleReply = (plan: ReplyPlan, events: ReplyEvents): void => {
  if (plan.deliveryDelay !== null) {
    setTimeout(events.delivered, plan.deliveryDelay);
  }
  const responderId = plan.responderId;
  if (!responderId) {
    return;
  }
  setTimeout(() => {
    events.typing(responderId);
    events.read();
    setTimeout(() => events.reply(responderId, plan.text), plan.replyDelay);
  }, plan.typingDelay);
};
