import { ActivityEvent } from '../models/activity';
import { Channel } from '../models/channel';
import { Message } from '../models/message';
import { WorkspaceActivityEvent } from '../models/workspace-activity';
import { personActivityOf, PersonActivitySources } from './person-activity';

const teamEvent = (id: string, actorId: string, occurredAt: number): ActivityEvent => ({
  id,
  actorId,
  verb: 'uploaded',
  object: `${id}.fig`,
  occurredAt,
  teamId: 't1',
  kind: 'file',
  route: '/files',
});

const workspaceEvent: WorkspaceActivityEvent = {
  id: 'w1',
  workspaceId: 'ws1',
  actorId: 'u1',
  verb: 'joined',
  object: 'the Design team',
  occurredAt: 50,
  kind: 'join',
  route: '/teams/t1',
};

const channel = (id: string, isPrivate: boolean): Channel => ({
  id,
  teamId: 't1',
  name: id,
  description: '',
  memberIds: [],
  isPrivate,
  createdLabel: 'Jan 2026',
  createdBy: 'u2',
});

const message = (id: string, authorId: string, text: string, sentAt: number): Message => ({
  id,
  conversationId: 'c',
  authorId,
  text,
  sentAt,
  attachments: [],
  reactions: [],
  replyToId: null,
  threadRootId: null,
  pinned: false,
  deliveryState: 'sent',
});

const sources: PersonActivitySources = {
  teamActivity: [teamEvent('a1', 'u1', 10), teamEvent('a2', 'u2', 90), teamEvent('a3', 'u1', 70)],
  workspaceActivity: [workspaceEvent],
  channels: [channel('general', false), channel('secret', true)],
  messages: {
    general: [message('m1', 'u1', 'First', 20), message('m2', 'u1', 'Latest', 60)],
    secret: [message('m3', 'u1', 'Hidden', 100)],
  },
};

describe('person activity', () => {
  it('merges team, workspace and public channel activity newest first', () => {
    expect(personActivityOf('u1', sources).map((item) => item.id)).toEqual([
      'a3',
      'm2',
      'w1',
      'a1',
    ]);
  });

  it('links the latest public post with its snippet', () => {
    const post = personActivityOf('u1', sources).find((item) => item.id === 'm2');
    expect(post).toMatchObject({
      verb: 'posted in',
      object: '#general',
      route: '/teams/t1/channels/general',
      snippet: 'Latest',
      icon: 'message-square',
    });
  });

  it('keeps only the most recent items', () => {
    expect(personActivityOf('u1', sources, 2)).toHaveLength(2);
    expect(personActivityOf('u9', sources)).toEqual([]);
  });
});
