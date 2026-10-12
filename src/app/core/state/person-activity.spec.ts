import { ActivityEvent } from '../models/activity';
import { Channel } from '../models/channel';
import { Message } from '../models/message';
import { personActivityOf, PersonActivitySources } from './person-activity';

const fileEvent = (id: string, actorId: string, occurredAt: number): ActivityEvent => ({
  id,
  workspaceId: 'ws1',
  actorId,
  verb: 'uploaded',
  object: `${id}.fig`,
  occurredAt,
  kind: 'file',
  route: '/files',
  category: 'activity',
  entity: null,
  teamId: 't1',
  change: null,
  action: 'file.uploaded',
  meta: null,
  outcome: 'succeeded',
  audit: false,
});

const joinEvent: ActivityEvent = {
  ...fileEvent('w1', 'u1', 50),
  verb: 'joined',
  object: 'the Design team',
  kind: 'join',
  route: '/teams/t1',
  teamId: null,
};

const auditEvent: ActivityEvent = {
  ...fileEvent('audit', 'u1', 95),
  verb: 'invited',
  kind: 'invite',
  category: 'audit',
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
  events: [
    fileEvent('a1', 'u1', 10),
    fileEvent('a2', 'u2', 90),
    fileEvent('a3', 'u1', 70),
    joinEvent,
    auditEvent,
  ],
  channels: [channel('general', false), channel('secret', true)],
  messages: {
    general: [message('m1', 'u1', 'First', 20), message('m2', 'u1', 'Latest', 60)],
    secret: [message('m3', 'u1', 'Hidden', 100)],
  },
};

describe('person activity', () => {
  it('merges their activity events and public channel posts newest first, without audit events', () => {
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
