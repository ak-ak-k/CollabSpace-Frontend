import { MessageSeed } from './message-seed';

export const MOCK_CHANNEL_MESSAGE_SEEDS: Readonly<Record<string, readonly MessageSeed[]>> = {
  'c-frontend': [
    {
      authorId: 'u7',
      minutesAgo: 1640,
      text: 'Heads up: the 2.4 regression suite caught a flaky test in the file uploader. Tracking in NS-151.',
    },
    { authorId: 'u1', minutesAgo: 1635, text: 'I’ll take it — pretty sure it’s the retry timer.' },
    {
      authorId: 'u6',
      minutesAgo: 1630,
      text: 'Mobile web sees the same thing on slow 3G.',
      reactions: [{ emoji: '👀', userIds: ['u1', 'u7'] }],
    },
    {
      authorId: 'u1',
      minutesAgo: 300,
      text: 'Reminder: code freeze for 2.4 is Wednesday, 6 pm IST.',
      reactions: [{ emoji: '👍', userIds: ['u0', 'u4', 'u6', 'u7'] }],
      pinned: true,
    },
    {
      authorId: 'u2',
      minutesAgo: 150,
      text: 'Design QA notes are in — mostly spacing on the settings screens.',
      attachments: [{ kind: 'file', type: 'pdf', name: 'Design QA — 2.4.pdf', size: '3.1 MB' }],
    },
    {
      authorId: 'u4',
      minutesAgo: 12,
      text: '@Aarav can you sign off on the final nav changes today?',
    },
  ],
  'c-design-system': [
    {
      authorId: 'u5',
      minutesAgo: 4320,
      text: 'Tokens v2 is merged. Please stop using the legacy grey scale.',
      reactions: [{ emoji: '🎉', userIds: ['u1', 'u2', 'u0'] }],
      pinned: true,
    },
    {
      authorId: 'u1',
      minutesAgo: 4280,
      text: 'Migration codemod is in the repo: npm run tokens:migrate',
    },
    {
      authorId: 'u5',
      minutesAgo: 180,
      text: '@Aarav tokens v2 needs your sign-off for the release notes.',
    },
  ],
  'c-releases': [
    {
      authorId: 'u4',
      minutesAgo: 1760,
      text: 'Release checklist for 2.4',
      attachments: [
        { kind: 'file', type: 'pdf', name: 'Release checklist 2.4.pdf', size: '420 KB' },
      ],
      pinned: true,
    },
    {
      authorId: 'u8',
      minutesAgo: 190,
      text: 'Staging deploy #482 succeeded. Smoke tests are green.',
      reactions: [{ emoji: '✅', userIds: ['u4', 'u1'] }],
    },
  ],
  'c-backend': [
    {
      authorId: 'u3',
      minutesAgo: 1540,
      text: 'Postgres 16 upgrade is scheduled for Saturday, 02:00 IST.',
    },
    { authorId: 'u11', minutesAgo: 1530, text: 'I’ll pause the analytics sync during the window.' },
  ],
  'c-api': [
    {
      authorId: 'u3',
      minutesAgo: 2880,
      text: 'v2 spec is up for review.',
      attachments: [{ kind: 'file', type: 'code', name: 'api-v2-spec.yaml', size: '48 KB' }],
    },
  ],
  'c-incidents': [
    {
      authorId: 'u8',
      minutesAgo: 8640,
      text: 'Postmortem for the 17 Sep queue backlog is published.',
      pinned: true,
    },
  ],
  'c-design': [
    {
      authorId: 'u2',
      minutesAgo: 1460,
      text: 'Posting WIP for the settings redesign — rough, feedback welcome.',
    },
  ],
  'c-research': [],
  'c-mobile': [
    { authorId: 'u6', minutesAgo: 400, text: 'iOS 2.4 build 311 is on TestFlight.' },
    { authorId: 'u7', minutesAgo: 380, text: 'Starting regression now.' },
  ],
  'c-growth': [
    {
      authorId: 'u9',
      minutesAgo: 1500,
      text: 'Onboarding checklist experiment: +6.2% day-7 activation so far.',
      reactions: [{ emoji: '🎉', userIds: ['u0', 'u11'] }],
    },
  ],
  'c-support': [
    {
      authorId: 'u10',
      minutesAgo: 2880,
      text: '@Aarav a customer is asking about the SSO timeline — can we share a date?',
    },
  ],
};
