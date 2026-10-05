import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TeamMembershipState } from './team-membership.state';
import { WorkspaceState } from './workspace.state';

describe('TeamMembershipState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const load = async () => {
    const workspace = TestBed.inject(WorkspaceState);
    const teams = TestBed.inject(TeamMembershipState);
    await settle();
    return { workspace, teams };
  };

  const channel = (workspace: WorkspaceState, channelId: string) =>
    workspace.channels().find((candidate) => candidate.id === channelId);

  it('reads team roles from the owner and the admins', async () => {
    const { teams } = await load();

    expect(teams.roleOf('t-frontend', 'u4')).toBe('owner');
    expect(teams.roleOf('t-frontend', 'u1')).toBe('admin');
    expect(teams.roleOf('t-frontend', 'u2')).toBe('member');
    expect(teams.canManageTeam('t-frontend')).toBe(true);
  });

  it('adds people to the team and its public channels only', async () => {
    const { workspace, teams } = await load();

    await teams.addToTeam('t-platform', ['u30']);

    expect(workspace.team('t-platform')?.memberIds).toContain('u30');
    expect(channel(workspace, 'c-api')?.memberIds).toContain('u30');
    expect(channel(workspace, 'c-incidents')?.memberIds).not.toContain('u30');
  });

  it('removes a member from the team, its admins and every team channel', async () => {
    const { workspace, teams } = await load();

    await teams.removeFromTeam('t-frontend', 'u1');

    const team = workspace.team('t-frontend');
    expect(team?.memberIds).not.toContain('u1');
    expect(team?.adminIds).toEqual([]);
    expect(channel(workspace, 'c-frontend')?.memberIds).not.toContain('u1');
  });

  it('promotes and demotes admins but never changes the owner', async () => {
    const { teams } = await load();

    await teams.setTeamRole('t-design', 'u2', 'admin');
    expect(teams.roleOf('t-design', 'u2')).toBe('admin');

    await teams.setTeamRole('t-design', 'u2', 'member');
    expect(teams.roleOf('t-design', 'u2')).toBe('member');

    await teams.setTeamRole('t-design', 'u5', 'admin');
    expect(teams.roleOf('t-design', 'u5')).toBe('owner');
  });

  it('saves team settings and hides archived teams until they are restored', async () => {
    const { workspace, teams } = await load();

    await teams.updateTeam('t-growth', { name: 'Growth Lab', description: 'New', isPrivate: true });
    expect(workspace.team('t-growth')).toMatchObject({ name: 'Growth Lab', isPrivate: true });

    await teams.setArchived('t-growth', true);
    expect(workspace.team('t-growth')).toBeNull();

    await teams.setArchived('t-growth', false);
    expect(workspace.team('t-growth')?.archived).toBe(false);
  });
});
