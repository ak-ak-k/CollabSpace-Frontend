import { Attachment, DeliveryState, Message, Reaction } from '../models/message';
import { minutesAgo, MINUTES_PER_DAY } from './mock-clock';

interface ExtraMessageSeed {
  readonly id: string;
  readonly authorId: string;
  readonly minutesAgo: number;
  readonly text: string;
  readonly threadRootId?: string;
  readonly attachments?: readonly Attachment[];
  readonly reactions?: readonly Reaction[];
  readonly deliveryState?: DeliveryState;
}

interface ReplySeed {
  readonly authorId: string;
  readonly minutesAgo: number;
  readonly text: string;
  readonly attachments?: readonly Attachment[];
  readonly reactions?: readonly Reaction[];
}

const repliesTo = (rootId: string, replies: readonly ReplySeed[]): ExtraMessageSeed[] =>
  replies.map((reply, index) => ({ ...reply, id: `${rootId}-r${index}`, threadRootId: rootId }));

const EXTRA_SEEDS: Readonly<Record<string, readonly ExtraMessageSeed[]>> = {
  'c-frontend': [
    {
      id: 'c-frontend-t1',
      authorId: 'u2',
      minutesAgo: 185,
      text: 'Can we finalise the dashboard design today? I’d like to hand it to engineering tomorrow morning.',
      reactions: [{ emoji: '👍', userIds: ['u1', 'u4'] }],
    },
    ...repliesTo('c-frontend-t1', [
      {
        authorId: 'u1',
        minutesAgo: 172,
        text: 'Almost — the stats row still needs its tablet layout.',
      },
      { authorId: 'u4', minutesAgo: 160, text: 'Let’s timebox it and review together at 4 pm.' },
      {
        authorId: 'u2',
        minutesAgo: 128,
        text: 'Works for me. Updated frames are in the file.',
        attachments: [{ kind: 'file', type: 'design', name: 'Dashboard v4.fig', size: '12.4 MB' }],
      },
      { authorId: 'u4', minutesAgo: 20, text: '@Aarav can you join the 4 pm review?' },
    ]),
  ],
  'g-launch': repliesTo('g-launch-0', [
    {
      authorId: 'u1',
      minutesAgo: MINUTES_PER_DAY + 280,
      text: 'Changelog draft is in the doc — it needs a product pass.',
    },
    {
      authorId: 'u0',
      minutesAgo: MINUTES_PER_DAY + 250,
      text: 'On it after standup.',
      reactions: [{ emoji: '👍', userIds: ['u1'] }],
    },
    {
      authorId: 'u2',
      minutesAgo: 35,
      text: 'Added screenshots for the new composer.',
      reactions: [{ emoji: '🎉', userIds: ['u4'] }],
    },
  ]),
  'dm-u2': repliesTo('dm-u2-0', [
    {
      authorId: 'u0',
      minutesAgo: MINUTES_PER_DAY + 5,
      text: 'Left comments on the empty states — the illustrations feel heavy.',
    },
    { authorId: 'u2', minutesAgo: 180, text: 'Agreed. Swapped them for type-only versions.' },
  ]),
  'g-design': [
    {
      id: 'g-design-f1',
      authorId: 'u0',
      minutesAgo: 25,
      text: 'Uploading the icon audit sheet now — I’ll share it before crit.',
      deliveryState: 'failed',
    },
  ],
};

const messageOf = (conversationId: string, seed: ExtraMessageSeed): Message => ({
  id: seed.id,
  conversationId,
  authorId: seed.authorId,
  text: seed.text,
  sentAt: minutesAgo(seed.minutesAgo),
  attachments: seed.attachments ?? [],
  reactions: seed.reactions ?? [],
  replyToId: null,
  threadRootId: seed.threadRootId ?? null,
  pinned: false,
  deliveryState: seed.deliveryState ?? 'sent',
});

export const buildExtraMessages = (): Record<string, Message[]> =>
  Object.fromEntries(
    Object.entries(EXTRA_SEEDS).map(([conversationId, seeds]) => [
      conversationId,
      seeds.map((seed) => messageOf(conversationId, seed)),
    ]),
  );
