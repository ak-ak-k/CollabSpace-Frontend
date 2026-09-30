import { MessageSeed } from './message-seed';

export const MOCK_GROUP_MESSAGE_SEEDS: Readonly<Record<string, readonly MessageSeed[]>> = {
  'g-launch': [
    {
      authorId: 'u4',
      minutesAgo: 1740,
      text: 'Release checklist for 2.4 is up in #releases. Two items left: push notification copy and the changelog.',
      pinned: true,
    },
    {
      authorId: 'u2',
      minutesAgo: 1720,
      text: 'Updated banner — went with the monochrome version.',
      attachments: [
        {
          kind: 'image',
          type: 'image',
          name: 'release-banner-v2.png',
          size: '640 KB',
          dimensions: '1600 × 900',
        },
      ],
      reactions: [
        { emoji: '❤️', userIds: ['u0', 'u4'] },
        { emoji: '👀', userIds: ['u1'] },
      ],
    },
    { authorId: 'u0', minutesAgo: 1715, text: 'That’s the one. Ship it.' },
    {
      authorId: 'u1',
      minutesAgo: 140,
      text: 'Changelog draft is ready.',
      attachments: [{ kind: 'file', type: 'code', name: 'CHANGELOG-2.4.md', size: '12 KB' }],
    },
    {
      authorId: 'u4',
      minutesAgo: 132,
      text: 'Perfect. Let’s lock scope at 5 pm today — anything not merged moves to 2.5.',
      reactions: [{ emoji: '👍', userIds: ['u0', 'u1', 'u2'] }],
    },
    {
      authorId: 'u2',
      minutesAgo: 40,
      text: 'Push copy is final. Sending it to Meera for localisation.',
    },
  ],
  'g-design': [
    { authorId: 'u5', minutesAgo: 1840, text: 'Critique moves to Thursday 3 pm this week.' },
    { authorId: 'u9', minutesAgo: 1830, text: 'I’ll bring the new pricing page concepts.' },
    {
      authorId: 'u5',
      minutesAgo: 260,
      text: 'Agenda for Thursday: onboarding v3, pricing page, icon audit.',
      pinned: true,
    },
  ],
  'g-q4': [
    {
      authorId: 'u4',
      minutesAgo: 5820,
      text: 'Draft OKRs are in the doc — comments by Friday please.',
      attachments: [{ kind: 'file', type: 'doc', name: 'Q4 OKRs.docx', size: '96 KB' }],
    },
    {
      authorId: 'u10',
      minutesAgo: 5780,
      text: 'Added two objectives around customer onboarding time.',
    },
  ],
};
