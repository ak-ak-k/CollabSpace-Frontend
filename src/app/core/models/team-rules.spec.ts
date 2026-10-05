import { MOCK_TEAMS } from '../mocks/teams.mock';
import { Channel } from './channel';
import {
  canManageTeam,
  channelWithMembers,
  teamRoleOf,
  withoutTeamMember,
  withTeamMembers,
  withTeamRole,
} from './team-rules';

const frontend = MOCK_TEAMS[0];

const privateChannel: Channel = {
  id: 'c-private',
  teamId: frontend.id,
  name: 'private',
  description: '',
  memberIds: ['u4'],
  isPrivate: true,
  createdLabel: 'Jan 2026',
  createdBy: 'u4',
};

describe('team rules', () => {
  it('resolves owner, admin and member roles', () => {
    expect(teamRoleOf(frontend, 'u4')).toBe('owner');
    expect(teamRoleOf(frontend, 'u1')).toBe('admin');
    expect(teamRoleOf(frontend, 'u2')).toBe('member');
  });

  it('lets workspace managers, the owner and admins manage a team', () => {
    expect(canManageTeam(frontend, 'u2', false)).toBe(false);
    expect(canManageTeam(frontend, 'u2', true)).toBe(true);
    expect(canManageTeam(frontend, 'u1', false)).toBe(true);
  });

  it('adds members once and drops admin rights on removal', () => {
    const added = withTeamMembers(frontend, ['u2', 'u30'], 'u0');
    expect(added.memberIds.filter((id) => id === 'u2').length).toBe(1);
    expect(added.memberIds).toContain('u30');

    const removed = withoutTeamMember(withTeamRole(added, 'u30', 'admin'), 'u30', 'u0');
    expect(removed.adminIds).not.toContain('u30');
    expect(removed.memberIds).not.toContain('u30');
  });

  it('never adds new members to private channels', () => {
    expect(channelWithMembers(privateChannel, ['u30']).memberIds).toEqual(['u4']);
  });
});
