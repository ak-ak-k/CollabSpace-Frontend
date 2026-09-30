import { MessageSeed } from './message-seed';

export const MOCK_DIRECT_MESSAGE_SEEDS: Readonly<Record<string, readonly MessageSeed[]>> = {
  'dm-u1': [
    {
      authorId: 'u1',
      minutesAgo: 1535,
      text: 'Pushed the virtualized list for the inbox. Scrolling is finally smooth on low-end Android.',
      reactions: [{ emoji: '🚀', userIds: ['u0'] }],
    },
    { authorId: 'u0', minutesAgo: 1528, text: 'Huge. Did you get numbers?' },
    {
      authorId: 'u1',
      minutesAgo: 1526,
      text: 'Profiled on a Redmi 9: 42 → 60 fps, and memory is down about 30%.',
      reactions: [{ emoji: '🎉', userIds: ['u0'] }],
    },
    {
      authorId: 'u1',
      minutesAgo: 96,
      text: 'Morning! Could you review PR #1284 before standup? It’s the message composer refactor.',
    },
    {
      authorId: 'u1',
      minutesAgo: 95,
      text: '',
      attachments: [{ kind: 'file', type: 'pdf', name: 'composer-states.pdf', size: '1.8 MB' }],
    },
    { authorId: 'u0', minutesAgo: 80, text: 'On it. Anything specific you want eyes on?' },
    {
      authorId: 'u1',
      minutesAgo: 78,
      text: 'Mostly mention autocomplete — keyboard handling felt off in Safari.',
      replyToIndex: 5,
    },
    { authorId: 'u1', minutesAgo: 6, text: '@Aarav are we still shipping 2.4 on Thursday?' },
  ],
  'dm-u2': [
    {
      authorId: 'u2',
      minutesAgo: 1470,
      text: 'Sent you onboarding flow v3. The empty states are where I’d love feedback.',
      attachments: [{ kind: 'file', type: 'design', name: 'Onboarding v3.fig', size: '18.6 MB' }],
    },
    {
      authorId: 'u0',
      minutesAgo: 1450,
      text: 'Looking now — the checklist pattern works really well.',
    },
    {
      authorId: 'u2',
      minutesAgo: 190,
      text: 'Thanks! I’ll fold your comments in before crit on Thursday.',
    },
  ],
  'dm-u4': [
    { authorId: 'u4', minutesAgo: 55, text: 'Can we move our 1:1 to 4:30? Planning ran over.' },
    { authorId: 'u0', minutesAgo: 52, text: 'Works for me.' },
    {
      authorId: 'u4',
      minutesAgo: 51,
      text: 'Great, updated the invite.',
      reactions: [{ emoji: '👍', userIds: ['u0'] }],
    },
  ],
  'dm-u3': [
    {
      authorId: 'u3',
      minutesAgo: 2980,
      text: 'Rate limiter is live on staging. 429s now include a Retry-After header.',
    },
    { authorId: 'u0', minutesAgo: 2970, text: 'Thanks — I’ll let the mobile team know.' },
    {
      authorId: 'u3',
      minutesAgo: 150,
      text: 'Heads up, I’m out Friday. Vikram is covering on-call.',
    },
  ],
  'dm-u8': [
    {
      authorId: 'u8',
      minutesAgo: 4350,
      text: 'Deploy pipeline is green again. Root cause was an expired runner token.',
    },
    { authorId: 'u0', minutesAgo: 4345, text: 'Nice catch. Can we alert before tokens expire?' },
    {
      authorId: 'u8',
      minutesAgo: 4340,
      text: 'Already on it — the alert fires 7 days before expiry.',
      reactions: [{ emoji: '✅', userIds: ['u0'] }],
    },
  ],
  'dm-u5': [
    {
      authorId: 'u5',
      minutesAgo: 7260,
      text: 'Can you review the tokens v2 release note before it goes out?',
    },
    { authorId: 'u0', minutesAgo: 7240, text: 'Yes — I’ll do it today.' },
  ],
};
