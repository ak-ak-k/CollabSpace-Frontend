import { TestBed } from '@angular/core/testing';
import { ChatFlagsState } from './chat-flags.state';
import { ChatMembershipState } from './chat-membership.state';
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

  it('lists conversations and channels of joined teams, newest first', async () => {
    const chat = await load();
    const previews = chat.previews();
    const ids = previews.map((preview) => preview.id);

    expect(previews[0]).toMatchObject({ id: 'dm-u1', title: 'Rahul Mehta', unreadCount: 1 });
    expect(chat.preview('c-frontend')).toMatchObject({
      teamName: 'Frontend',
      route: '/teams/t-frontend/channels/c-frontend',
    });
    expect(ids).toContain('c-frontend');
    expect(ids).not.toContain('c-mobile');
  });

  it('keeps thread replies out of previews and the timeline', async () => {
    const chat = await load();

    expect(chat.preview('g-launch')?.preview).toBe(
      'Priya: Push copy is final. Sending it to Meera for localisation.',
    );
    expect(chat.timeline('c-frontend').some((message) => message.threadRootId)).toBe(false);
    expect(chat.messages()['c-frontend'].some((message) => message.threadRootId)).toBe(true);

    chat.markThreadRead('g-launch-0');
    expect(chat.threadUnreadCounts()['g-launch-0']).toBe(0);
  });

  it('lists saved messages newest first and toggles a save', async () => {
    const chat = await load();
    const flags = TestBed.inject(ChatFlagsState);

    expect(chat.savedMessages().map((item) => item.message.id)).toEqual([
      'c-frontend-t1',
      'dm-u2-0',
      'c-design-system-0',
    ]);

    expect(flags.toggleSave('c-frontend-t1')).toBe(false);
    expect(flags.toggleSave('dm-u1-0')).toBe(true);
    expect(chat.savedMessages()[0].message.id).toBe('dm-u1-0');
  });

  it('sets a notification level and keeps mute in step', async () => {
    const chat = await load();
    const flags = TestBed.inject(ChatFlagsState);

    flags.setNotifyLevel('g-launch', 'muted');
    expect(chat.preview('g-launch')?.muted).toBe(true);

    flags.setNotifyLevel('g-launch', 'mentions');
    expect(chat.notifyLevel('g-launch')).toBe('mentions');
    expect(chat.mutedIds().has('g-launch')).toBe(false);

    expect(flags.toggleMute('g-launch')).toBe(true);
    expect(chat.notifyLevel('g-launch')).toBe('muted');
  });

  it('hides left groups and archived channels and brings them back', async () => {
    const chat = await load();
    const membership = TestBed.inject(ChatMembershipState);
    const listed = (id: string) => chat.previews().some((preview) => preview.id === id);

    membership.leaveGroup('g-design');
    membership.archiveChannel('c-frontend');
    expect(listed('g-design')).toBe(false);
    expect(listed('c-frontend')).toBe(false);

    membership.rejoinGroup('g-design');
    membership.unarchiveChannel('c-frontend');
    expect(listed('g-design')).toBe(true);
    expect(chat.isArchived('c-frontend')).toBe(false);
  });

  it('renames a group and changes its members', async () => {
    const chat = await load();
    const membership = TestBed.inject(ChatMembershipState);

    await membership.renameGroup('g-launch', 'Ship crew');
    await membership.addToGroup('g-launch', ['u5', 'u1']);
    await membership.removeFromGroup('g-launch', 'u2');

    expect(chat.preview('g-launch')).toMatchObject({ title: 'Ship crew', memberCount: 4 });
  });

  it('marks a conversation unread from a message', async () => {
    const chat = await load();

    expect(chat.markUnreadFrom('dm-u1', 'dm-u1-0')).toBe(true);
    expect(chat.preview('dm-u1')?.unreadCount).toBeGreaterThan(1);
  });

  it('describes who is typing and prefixes group previews with the author', async () => {
    const chat = await load();

    expect(chat.preview('g-launch')?.typingText).toBe('Rahul is typing…');
    expect(chat.preview('c-frontend')?.preview.startsWith('Kavya: ')).toBe(true);
    expect(chat.preview('g-design')?.preview.startsWith('You: ')).toBe(true);
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

  it('shows previews without formatting markers', async () => {
    const chat = await load();
    await TestBed.inject(ChatMessagesState).send('dm-u2', {
      text: '**Ship** _it_ `now`',
      attachments: [],
      replyToId: null,
    });

    expect(chat.preview('dm-u2')?.preview).toBe('You: Ship it now');
  });

  it('keeps thread replies and their typing out of the conversation preview', async () => {
    const chat = await load();
    const before = chat.preview('g-launch')?.preview;
    await TestBed.inject(ChatMessagesState).send('g-launch', {
      text: 'Thread only',
      attachments: [],
      replyToId: null,
      threadRootId: 'g-launch-0',
    });
    chat.typingUserIds.update((typing) => ({ ...typing, 'g-launch:g-launch-0': ['u2'] }));

    expect(chat.preview('g-launch')?.preview).toBe(before);
    expect(chat.threadTypingText('g-launch', 'g-launch-0')).toBe('Priya is typing…');
    expect(chat.threadTypingText('g-launch', 'g-launch-1')).toBe('');
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
