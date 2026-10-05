import { MOCK_USERS } from '../mocks/users.mock';
import { Message } from '../models/message';
import { User } from '../models/user';
import { planThreadReply, THREAD_REPLY_DELAY, threadResponders } from './chat-simulation';

const message = (id: string, authorId: string, threadRootId: string | null = null): Message => ({
  id,
  conversationId: 'g-launch',
  authorId,
  text: id,
  sentAt: 0,
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId,
  pinned: false,
  deliveryState: 'sent',
});

const usersWith = (statuses: Readonly<Record<string, User['status']>>): Map<string, User> =>
  new Map(MOCK_USERS.map((user) => [user.id, { ...user, status: statuses[user.id] ?? 'offline' }]));

describe('thread reply simulation', () => {
  const thread = [
    message('root', 'u4'),
    message('r1', 'u1', 'root'),
    message('r2', 'u0', 'root'),
    message('r3', 'u3', 'root'),
    message('elsewhere', 'u2'),
  ];

  it('picks responders from the root author and repliers who are around', () => {
    const users = usersWith({ u0: 'online', u1: 'online', u3: 'offline', u4: 'away' });

    expect(threadResponders(thread, 'root', users, 'u0')).toEqual(['u4', 'u1']);
    expect(threadResponders(thread, 'missing', users, 'u0')).toEqual([]);
  });

  it('plans a reply in turn without delivery receipts', () => {
    const plan = planThreadReply(['u4', 'u1'], { u1: ['On it'], default: ['Thanks'] }, 1);

    expect(plan).toMatchObject({ responderId: 'u1', text: 'On it', deliveryDelay: null });
    expect(plan.replyDelay).toBe(THREAD_REPLY_DELAY);
    expect(planThreadReply([], { default: ['Thanks'] }, 0).responderId).toBeNull();
  });
});
