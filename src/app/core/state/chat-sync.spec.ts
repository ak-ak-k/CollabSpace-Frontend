import { signal } from '@angular/core';
import { Message } from '../models/message';
import { applyChatEvent, ChatSignals, typingKeyOf } from './chat-sync';

const reply = (authorId: string, rootId: string | null): Message => ({
  id: `m-${authorId}-${rootId}`,
  conversationId: 'g-launch',
  authorId,
  text: 'Sounds good',
  sentAt: 1,
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId: rootId,
  pinned: false,
  deliveryState: 'sent',
});

const chatSignals = (activeThreadId: string | null): ChatSignals => ({
  conversations: signal([]),
  messages: signal({}),
  unreadCounts: signal({}),
  threadUnreadCounts: signal({}),
  starredIds: signal(new Set<string>()),
  mutedIds: signal(new Set<string>()),
  leftIds: signal(new Set<string>()),
  archivedIds: signal(new Set<string>()),
  notifyLevels: signal({}),
  saved: signal({}),
  typingUserIds: signal({}),
  activeConversationId: signal('g-launch'),
  activeThreadId: signal(activeThreadId),
});

describe('chat sync', () => {
  it('keeps typing in a thread apart from typing in the conversation', () => {
    const chat = chatSignals(null);

    applyChatEvent(chat, {
      type: 'typing',
      conversationId: 'g-launch',
      threadRootId: 'g-launch-0',
      userIds: ['u2'],
    });

    expect(chat.typingUserIds()).toEqual({ 'g-launch:g-launch-0': ['u2'] });
    expect(typingKeyOf({ type: 'typing', conversationId: 'g-launch', userIds: [] })).toBe(
      'g-launch',
    );
  });

  it('counts thread replies from others unless that thread is open', () => {
    const closed = chatSignals(null);
    const open = chatSignals('g-launch-0');

    applyChatEvent(closed, { type: 'message', message: reply('u2', 'g-launch-0') });
    applyChatEvent(closed, { type: 'message', message: reply('u0', 'g-launch-0') });
    applyChatEvent(open, { type: 'message', message: reply('u2', 'g-launch-0') });

    expect(closed.threadUnreadCounts()).toEqual({ 'g-launch-0': 1 });
    expect(closed.messages()['g-launch'].length).toBe(2);
    expect(open.threadUnreadCounts()).toEqual({});
    expect(closed.unreadCounts()).toEqual({});
  });
});
