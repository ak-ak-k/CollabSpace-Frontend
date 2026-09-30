import { Conversation } from '../models/conversation';
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

const RESPONSIVE_STATUSES: readonly User['status'][] = ['online', 'away'];

const recipientsOf = (conversation: Conversation, currentUserId: string): readonly string[] =>
  conversation.type === 'dm'
    ? [conversation.userId]
    : conversation.memberIds.filter((memberId) => memberId !== currentUserId);

const statusOf = (users: ReadonlyMap<string, User>, userId: string): User['status'] =>
  users.get(userId)?.status ?? 'offline';

export const planReply = (
  conversation: Conversation,
  users: ReadonlyMap<string, User>,
  currentUserId: string,
  replies: Readonly<Record<string, readonly string[]>>,
  replyIndex: number,
): ReplyPlan => {
  const recipients = recipientsOf(conversation, currentUserId);
  const reachable = recipients.some((userId) => statusOf(users, userId) !== 'offline');
  const responsive = recipients.filter((userId) =>
    RESPONSIVE_STATUSES.includes(statusOf(users, userId)),
  );
  const responderId = responsive[replyIndex % Math.max(responsive.length, 1)] ?? null;
  const pool = (responderId && replies[responderId]) || replies['default'] || [];
  return {
    deliveryDelay: reachable ? DELIVERY_DELAY : null,
    responderId,
    typingDelay: TYPING_DELAY,
    replyDelay: REPLY_DELAY,
    text: pool[replyIndex % Math.max(pool.length, 1)] ?? '',
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
