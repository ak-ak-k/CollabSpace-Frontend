import { TestBed } from '@angular/core/testing';
import { ChatMessagesState } from './chat-messages.state';
import { ChatState } from './chat.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceState } from './workspace.state';

describe('ChatState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const load = async (): Promise<ChatState> => {
    TestBed.inject(WorkspaceState);
    const chat = TestBed.inject(ChatState);
    await settle();
    return chat;
  };

  it('lists direct and group conversations, newest first', async () => {
    const chat = await load();
    const previews = chat.previews();

    expect(previews.length).toBe(9);
    expect(previews[0]).toMatchObject({ id: 'dm-u1', title: 'Rahul Mehta', unreadCount: 1 });
    expect(previews.every((preview) => preview.type !== 'channel')).toBe(true);
  });

  it('describes who is typing and prefixes group previews with the author', async () => {
    const chat = await load();

    expect(chat.preview('g-launch')?.typingText).toBe('Rahul is typing…');
    expect(chat.preview('g-design')?.preview.startsWith('Ananya: ')).toBe(true);
  });

  it('separates the direct unread total from the workspace total', async () => {
    const chat = await load();

    expect(chat.unreadDirectTotal()).toBe(4);
    expect(chat.unreadTotal()).toBe(9);

    chat.markRead('g-launch');

    expect(chat.unreadDirectTotal()).toBe(2);
  });

  it('marks a conversation opened before loading as read once the data arrives', async () => {
    TestBed.inject(WorkspaceState);
    const chat = TestBed.inject(ChatState);
    chat.open('dm-u1');
    await settle();

    expect(chat.preview('dm-u1')?.unreadCount).toBe(0);
    expect(chat.newMessagesMarkerId()).not.toBeNull();
  });

  it('sends a message and restores a deleted one in its original place', async () => {
    const chat = await load();
    const sent = await TestBed.inject(ChatMessagesState).send('dm-u2', {
      text: 'Ship it',
      attachments: [],
      replyToId: null,
    });

    expect(chat.messages()['dm-u2'].at(-1)?.id).toBe(sent.id);

    const removed = await TestBed.inject(ChatMessagesState).remove('dm-u2', sent.id);
    expect(chat.messages()['dm-u2'].some((message) => message.id === sent.id)).toBe(false);

    await TestBed.inject(ChatMessagesState).restore(removed!);
    expect(chat.messages()['dm-u2'].at(-1)?.id).toBe(sent.id);
  });

  it('toggles the current user reaction on a message', async () => {
    const chat = await load();
    const messageId = chat.messages()['dm-u2'][0].id;

    await TestBed.inject(ChatMessagesState).react('dm-u2', messageId, '🚀');
    expect(chat.messages()['dm-u2'][0].reactions.some((reaction) => reaction.emoji === '🚀')).toBe(
      true,
    );

    await TestBed.inject(ChatMessagesState).react('dm-u2', messageId, '🚀');
    expect(chat.messages()['dm-u2'][0].reactions.some((reaction) => reaction.emoji === '🚀')).toBe(
      false,
    );
  });

  it('keeps each workspace inbox separate', async () => {
    const chat = await load();
    const workspace = TestBed.inject(WorkspaceState);

    workspace.switchWorkspace('w2');

    expect(chat.previews()).toEqual([]);
    expect(chat.unreadTotal()).toBe(0);
    expect(chat.inboxStatus()).toBe('empty');

    const id = await chat.openDirectConversation('u2');

    expect(id).toBe('dm-u2-w2');
    expect(chat.previews().map((preview) => preview.id)).toEqual(['dm-u2-w2']);
  });
});
