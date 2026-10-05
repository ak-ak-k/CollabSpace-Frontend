import { Channel } from '../models/channel';
import { TeamChannelAccess, teamUnreadCount, visibleTeamChannels } from './team-channels';

const channel = (id: string, isPrivate = false, memberIds: readonly string[] = []): Channel => ({
  id,
  teamId: 't1',
  name: id,
  description: '',
  memberIds,
  isPrivate,
  createdLabel: 'Jan 2026',
  createdBy: 'u1',
});

const channels = [
  channel('open'),
  channel('mine', true, ['me']),
  channel('secret', true, ['u2']),
  channel('archived'),
  channel('left'),
];

const access: TeamChannelAccess = {
  currentUserId: 'me',
  memberIdsOf: (candidate) => candidate.memberIds,
  isArchived: (channelId) => channelId === 'archived',
  hasLeft: (channelId) => channelId === 'left',
  unreadOf: () => 2,
};

const team = { channelIds: ['open', 'mine', 'secret', 'archived', 'left', 'missing'] };

describe('team channels', () => {
  it('hides archived channels and private channels I am not in', () => {
    expect(visibleTeamChannels(team, channels, access).map((visible) => visible.id)).toEqual([
      'open',
      'mine',
      'left',
    ]);
  });

  it('counts unread messages only in visible channels I have not left', () => {
    expect(teamUnreadCount(team, channels, access)).toBe(4);
  });
});
