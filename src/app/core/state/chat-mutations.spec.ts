import { Message } from '../models/message';
import {
  advanceDelivery,
  editMessage,
  failQueued,
  firstUnreadId,
  reactToMessage,
  releaseQueued,
  removeMessage,
  toggleReaction,
} from './chat-mutations';

const message = (
  id: string,
  authorId: string,
  deliveryState: Message['deliveryState'],
): Message => ({
  id,
  conversationId: 'dm-u1',
  authorId,
  text: `Message ${id}`,
  sentAt: Number.parseInt(id, 10),
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId: null,
  pinned: false,
  deliveryState,
});

const THREADS = { 'dm-u1': [message('1', 'u1', 'sent'), message('2', 'u0', 'sent')] };

describe('chat mutations', () => {
  it('toggles a reaction for a person and drops empty reactions', () => {
    const added = toggleReaction([], '👍', 'u0');
    const joined = toggleReaction(added, '👍', 'u1');
    const left = toggleReaction(joined, '👍', 'u0');

    expect(joined).toEqual([{ emoji: '👍', userIds: ['u0', 'u1'] }]);
    expect(left).toEqual([{ emoji: '👍', userIds: ['u1'] }]);
    expect(toggleReaction(left, '👍', 'u1')).toEqual([]);
  });

  it('edits, reacts and removes without touching other messages', () => {
    const edited = editMessage(THREADS, 'dm-u1', '2', '  Updated  ');
    const reacted = reactToMessage(edited, 'dm-u1', '1', '🎉', 'u0');
    const removed = removeMessage(reacted, 'dm-u1', '1');

    expect(edited['dm-u1'][1]).toMatchObject({ text: 'Updated', editedAt: expect.any(Number) });
    expect(reacted['dm-u1'][0].reactions).toEqual([{ emoji: '🎉', userIds: ['u0'] }]);
    expect(removed['dm-u1'].map((item) => item.id)).toEqual(['2']);
  });

  it('only moves delivery forward and never touches unsettled messages', () => {
    const threads = {
      'dm-u1': [
        message('1', 'u0', 'queued'),
        message('2', 'u0', 'read'),
        message('3', 'u0', 'failed'),
        message('4', 'u0', 'sent'),
      ],
    };

    const advanced = advanceDelivery(threads, 'dm-u1', 'u0', 'delivered');

    expect(advanced['dm-u1'].map((item) => item.deliveryState)).toEqual([
      'queued',
      'read',
      'failed',
      'delivered',
    ]);
    expect(releaseQueued(advanced)['dm-u1'][0].deliveryState).toBe('sent');
  });

  it('finds the first unread message', () => {
    expect(firstUnreadId(THREADS['dm-u1'], 1)).toBe('2');
    expect(firstUnreadId(THREADS['dm-u1'], 0)).toBeNull();
  });

  it('fails queued messages for a later retry and releases them on the next sync', () => {
    const threads = { 'dm-u1': [message('1', 'u0', 'queued'), message('2', 'u0', 'failed')] };

    const failed = failQueued(threads);
    expect(failed['dm-u1'].map((item) => [item.deliveryState, item.syncFailed])).toEqual([
      ['failed', true],
      ['failed', undefined],
    ]);

    const released = releaseQueued(failed);
    expect(released['dm-u1'].map((item) => [item.deliveryState, item.syncFailed])).toEqual([
      ['sent', false],
      ['failed', undefined],
    ]);
  });
});
