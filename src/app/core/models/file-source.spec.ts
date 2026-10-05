import { Conversation } from './conversation';
import { FileItem, UPLOAD_SOURCE } from './file-item';
import { canSeeFile, FileSourceLookup, referencesOf, sourceOf } from './file-source';

const conversations: Record<string, Conversation> = {
  'dm-u1': { id: 'dm-u1', type: 'dm', userId: 'u1', workspaceId: 'w1' },
  'c-frontend': {
    id: 'c-frontend',
    type: 'channel',
    channelId: 'c-frontend',
    teamId: 't-frontend',
    name: 'frontend',
    memberIds: ['u0'],
  },
};

const lookup: FileSourceLookup = {
  conversation: (id) => conversations[id] ?? null,
  userName: () => 'Rahul Mehta',
  teamName: (id) => (id === 't-frontend' ? 'Frontend' : null),
  taskTitle: (id) => (id === 'NS-1' ? 'Composer' : null),
  hasMessage: (_, messageId) => messageId === 'c-frontend-4',
};

const file = (changes: Partial<FileItem>): FileItem => ({
  workspaceId: 'w1',
  id: 'f1',
  name: 'Spec.pdf',
  extension: 'pdf',
  type: 'pdf',
  sizeLabel: '1 MB',
  bytes: 1_000_000,
  ownerId: 'u1',
  uploadedAt: 0,
  modifiedAt: 0,
  location: '',
  shared: true,
  starred: false,
  source: UPLOAD_SOURCE,
  teamId: null,
  taskIds: [],
  previewUrl: null,
  ...changes,
});

describe('file sources', () => {
  it('labels and links every kind of source', () => {
    expect(sourceOf(file({}), lookup)).toMatchObject({ label: 'Uploaded directly', link: null });
    expect(sourceOf(file({ teamId: 't-frontend' }), lookup)).toMatchObject({
      label: 'Uploaded to Frontend',
      link: { path: '/teams/t-frontend/files' },
    });
    const direct = { type: 'message', conversationId: 'dm-u1', messageId: null } as const;
    expect(sourceOf(file({ source: direct }), lookup).label).toBe('DM with Rahul Mehta');
    const channel = {
      type: 'message',
      conversationId: 'c-frontend',
      messageId: 'c-frontend-4',
    } as const;
    expect(sourceOf(file({ source: channel }), lookup).link?.path).toBe(
      '/teams/t-frontend/channels/c-frontend/m/c-frontend-4',
    );
    expect(sourceOf(file({ source: { type: 'task', taskId: 'NS-1' } }), lookup)).toMatchObject({
      label: 'NS-1 · Composer',
      link: { path: '/tasks', queryParams: { task: 'NS-1' } },
    });
  });

  it('lists the other places a file was shared', () => {
    const shared = file({ source: { type: 'task', taskId: 'NS-1' }, taskIds: ['NS-1', 'NS-2'] });
    expect(referencesOf(shared, lookup, ['dm-u1']).map((reference) => reference.label)).toEqual([
      'NS-1 · Composer',
      'NS-2',
      'DM with Rahul Mehta',
    ]);
  });

  it('hides files from private channels the current user is not in', () => {
    const access = {
      currentUserId: 'u0',
      channel: () => ({ teamId: 't-frontend', memberIds: ['u1'], isPrivate: true }),
      team: () => null,
    };
    const secret = file({
      source: { type: 'message', conversationId: 'c-secret', messageId: null },
    });
    expect(canSeeFile(secret, access)).toBe(false);
    expect(canSeeFile(file({}), access)).toBe(true);
  });
});
