import { DirectConversation, GroupConversation } from '../models/conversation';
import { SavedEntry } from '../models/message';
import { minutesAgo, MINUTES_PER_DAY } from './mock-clock';

export const MOCK_CONVERSATIONS: readonly (DirectConversation | GroupConversation)[] = [
  { id: 'dm-u1', type: 'dm', userId: 'u1', workspaceId: 'w1' },
  {
    id: 'g-launch',
    type: 'group',
    name: 'Launch crew',
    memberIds: ['u0', 'u1', 'u2', 'u4'],
    workspaceId: 'w1',
    createdBy: 'u0',
  },
  { id: 'dm-u2', type: 'dm', userId: 'u2', workspaceId: 'w1' },
  { id: 'dm-u4', type: 'dm', userId: 'u4', workspaceId: 'w1' },
  {
    id: 'g-design',
    type: 'group',
    name: 'Design critique',
    memberIds: ['u0', 'u2', 'u5', 'u9'],
    workspaceId: 'w1',
    createdBy: 'u0',
  },
  { id: 'dm-u3', type: 'dm', userId: 'u3', workspaceId: 'w1' },
  { id: 'dm-u8', type: 'dm', userId: 'u8', workspaceId: 'w1' },
  {
    id: 'g-q4',
    type: 'group',
    name: 'Q4 planning',
    memberIds: ['u0', 'u4', 'u9', 'u10'],
    workspaceId: 'w1',
    createdBy: 'u0',
  },
  { id: 'dm-u5', type: 'dm', userId: 'u5', workspaceId: 'w1' },
];

export const MOCK_UNREAD_COUNTS: Readonly<Record<string, number>> = {
  'dm-u1': 1,
  'g-launch': 2,
  'g-design': 1,
  'c-frontend': 3,
  'c-design-system': 1,
  'c-support': 1,
};

export const MOCK_STARRED_CONVERSATION_IDS: readonly string[] = ['g-launch', 'c-frontend'];

export const MOCK_THREAD_UNREAD_COUNTS: Readonly<Record<string, number>> = {
  'c-frontend-t1': 1,
  'g-launch-0': 1,
};

export const MOCK_SAVED_MESSAGES: Readonly<Record<string, SavedEntry>> = {
  'c-design-system-0': {
    conversationId: 'c-design-system',
    savedAt: minutesAgo(MINUTES_PER_DAY + 30),
  },
  'dm-u2-0': { conversationId: 'dm-u2', savedAt: minutesAgo(MINUTES_PER_DAY) },
  'c-frontend-t1': { conversationId: 'c-frontend', savedAt: minutesAgo(90) },
};

export const MOCK_TYPING_USER_IDS: Readonly<Record<string, readonly string[]>> = {
  'g-launch': ['u1'],
};

export const MOCK_REPLIES: Readonly<Record<string, readonly string[]>> = {
  u1: [
    'Yes — Thursday is still the plan. Code freeze is tomorrow evening.',
    'Pushed a fix for the Safari issue, mind taking another look?',
    'Sounds good, thanks!',
  ],
  u2: ['Love that. I’ll update the file.', 'Can we look at it together after lunch?'],
  u4: ['Perfect, thanks.', 'Let’s sync on it at standup.'],
  u6: ['On it.', 'Will do — build is running now.'],
  u8: ['Done. Pipeline’s green.', 'Checking the logs now.'],
  u10: ['Great, I’ll let the customer know.', 'Thanks — that helps a lot.'],
  default: ['Got it, thanks!', 'Makes sense.', 'Will get back to you shortly.'],
};
