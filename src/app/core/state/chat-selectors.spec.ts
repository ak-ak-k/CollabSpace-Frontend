import { Message } from '../models/message';
import {
  savedMessagesOf,
  threadOf,
  threadSummariesOf,
  timelineOf,
  unreadFromHere,
} from './chat-selectors';

const message = (id: string, authorId: string, threadRootId: string | null = null): Message => ({
  id,
  conversationId: 'g-launch',
  authorId,
  text: `Message ${id}`,
  sentAt: Number.parseInt(id, 10),
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId,
  pinned: false,
  deliveryState: 'sent',
});

const MESSAGES = [
  message('1', 'u1'),
  message('2', 'u2', '1'),
  message('3', 'u0'),
  message('4', 'u4', '1'),
  message('5', 'u2'),
];

describe('chat selectors', () => {
  it('keeps thread replies out of the timeline and gathers them per thread', () => {
    expect(timelineOf(MESSAGES).map((item) => item.id)).toEqual(['1', '3', '5']);
    expect(threadOf(MESSAGES, '1').map((item) => item.id)).toEqual(['1', '2', '4']);
  });

  it('summarises each thread with its replies, last reply and unread count', () => {
    const summary = threadSummariesOf(MESSAGES, { '1': 2 }).get('1');

    expect(summary).toEqual({
      replyCount: 2,
      lastReplyAt: 4,
      participantIds: ['u2', 'u4'],
      unreadCount: 2,
    });
  });

  it('counts unread messages from others starting at a message', () => {
    const timeline = timelineOf(MESSAGES);

    expect(unreadFromHere(timeline, '3', 'u0')).toBe(1);
    expect(unreadFromHere(timeline, '1', 'u0')).toBe(2);
    expect(unreadFromHere(timeline, 'missing', 'u0')).toBeNull();
  });

  it('lists saved messages that still exist, newest save first', () => {
    const saved = {
      '1': { conversationId: 'g-launch', savedAt: 10 },
      '5': { conversationId: 'g-launch', savedAt: 20 },
      gone: { conversationId: 'g-launch', savedAt: 30 },
    };

    const list = savedMessagesOf(saved, { 'g-launch': MESSAGES }, () => true);

    expect(list.map((item) => item.message.id)).toEqual(['5', '1']);
  });
});
