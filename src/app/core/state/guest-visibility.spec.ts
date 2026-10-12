import { canSeeTeam, readableTeamIdsOf, Viewer, visibleMembersFor } from './guest-visibility';

const guest: Viewer = { userId: 'me', role: 'guest' };
const member: Viewer = { userId: 'me', role: 'member' };

const teams = [
  { id: 't1', memberIds: ['me', 'u1'], isPrivate: false },
  { id: 't2', memberIds: ['u2', 'u3'], isPrivate: false },
  { id: 't3', memberIds: ['u4'], isPrivate: true },
];
const people = ['me', 'u1', 'u2', 'u3', 'u4'].map((id) => ({ id }));

describe('guest visibility', () => {
  it('shows guests only the teams they belong to', () => {
    expect(teams.filter((team) => canSeeTeam(team, guest)).map((team) => team.id)).toEqual(['t1']);
  });

  it('hides private teams from members who are not in them', () => {
    expect(teams.filter((team) => canSeeTeam(team, member)).map((team) => team.id)).toEqual([
      't1',
      't2',
    ]);
    expect(canSeeTeam(teams[2], { userId: 'u4', role: 'member' })).toBe(true);
  });

  it('shows guests only themselves and their teammates', () => {
    expect(visibleMembersFor(people, teams, guest).map((person) => person.id)).toEqual([
      'me',
      'u1',
    ]);
    expect(visibleMembersFor(people, teams, member)).toHaveLength(5);
  });

  it('hides channels of private teams you are not in', () => {
    expect([...readableTeamIdsOf(teams, 'me')]).toEqual(['t1', 't2']);
    expect(readableTeamIdsOf(teams, 'u4').has('t3')).toBe(true);
  });
});
