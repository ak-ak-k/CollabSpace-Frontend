import { MOCK_USERS } from '../mocks/users.mock';
import { Message } from '../models/message';
import { MessageRow, ThreadRow } from '../models/thread';
import { replyCountLabel, threadPreviewOf } from './chat-thread-view';
import { buildThread, ThreadOptions } from './thread-view';

const MINUTE = 60_000;
const START = new Date(2026, 9, 5, 9, 0).getTime();

const message = (id: string, authorId: string, minute: number, rootId: string | null = null) =>
  ({
    id,
    conversationId: 'g-launch',
    authorId,
    text: `Message ${id}`,
    sentAt: START + minute * MINUTE,
    attachments: [],
    reactions: [],
    replyToId: null,
    threadRootId: rootId,
    pinned: false,
    deliveryState: 'sent',
  }) satisfies Message;

const MESSAGES: readonly Message[] = [
  message('root', 'u1', 0),
  message('r1', 'u2', 10, 'root'),
  message('r2', 'u2', 11, 'root'),
  message('other', 'u4', 12),
  message('lonely', 'u0', 20),
];

const OPTIONS: ThreadOptions = {
  currentUserId: 'u0',
  usersById: new Map(MOCK_USERS.map((user) => [user.id, user])),
  searchTerm: '',
  newMarkerId: null,
  rootId: null,
  savedIds: new Set(),
  threadUnreadCounts: { root: 1 },
};

const messageRows = (rows: readonly ThreadRow[]): MessageRow[] =>
  rows.filter((row): row is MessageRow => row.kind === 'message');

describe('thread panel rows', () => {
  it('lists the root, a replies separator and the replies without day rows', () => {
    const rows = buildThread(MESSAGES, { ...OPTIONS, rootId: 'root' });

    expect(rows.map((row) => row.key)).toEqual(['root', 'thread-replies', 'r1', 'r2']);
    expect(rows[1]).toMatchObject({ kind: 'day', label: '2 replies' });
    expect(messageRows(rows).map((row) => row.message.continuation)).toEqual([false, false, true]);
    expect(messageRows(rows).every((row) => row.message.thread === null)).toBe(true);
  });

  it('says when a root has no replies and returns nothing for an unknown root', () => {
    expect(buildThread(MESSAGES, { ...OPTIONS, rootId: 'lonely' })[1]).toMatchObject({
      label: 'No replies yet',
    });
    expect(buildThread(MESSAGES, { ...OPTIONS, rootId: 'nope' })).toEqual([]);
    expect(buildThread(MESSAGES, { ...OPTIONS, rootId: 'r1' })).toEqual([]);
  });

  it('summarises a root in the main log with its participants and new replies', () => {
    const root = messageRows(buildThread(MESSAGES, OPTIONS)).find(
      (row) => row.message.id === 'root',
    );

    expect(root?.message.thread).toMatchObject({
      replyCount: 2,
      unreadCount: 1,
      participants: [{ id: 'u2', name: 'Priya Sharma' }],
    });
    expect(root?.message.accessibleLabel).toContain('2 replies');
  });

  it('labels reply counts and resolves unknown participants', () => {
    expect(replyCountLabel(1)).toBe('1 reply');
    expect(replyCountLabel(3)).toBe('3 replies');
    const summary = { replyCount: 1, lastReplyAt: 0, participantIds: ['ghost'], unreadCount: 0 };
    expect(threadPreviewOf(summary, new Map()).participants[0].name).toBe('Someone');
  });
});
