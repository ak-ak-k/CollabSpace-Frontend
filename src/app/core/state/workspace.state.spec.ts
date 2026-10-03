import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceAdminState } from './workspace-admin.state';
import { WorkspaceState } from './workspace.state';

describe('WorkspaceState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  it('loads the directory and knows the current user and workspace', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    expect(workspace.status()).toBe('ready');
    expect(workspace.currentUser()?.name).toBe('Aarav Shah');
    expect(workspace.currentWorkspace()?.name).toBe('Northstar Labs');
    expect(workspace.joinedTeams().length).toBe(5);
    expect(workspace.members().length).toBe(48);
    expect(workspace.onlineUserCount()).toBe(19);
  });

  it('updates presence for the current user', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    await workspace.setPresence('dnd');

    expect(workspace.currentUser()?.status).toBe('dnd');
    expect(workspace.onlineUserCount()).toBe(18);
  });

  it('creates a team with its general channel', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    const { team } = await workspace.createTeam({
      name: 'Data Platform',
      description: '',
      privacy: 'private',
    });

    expect(team).toMatchObject({ code: 'DP', joined: true, isPrivate: true });
    expect(workspace.channels().at(-1)?.name).toBe('general');
  });

  it('scopes members, roles and teams to the current workspace', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    expect(workspace.access()).toMatchObject({ myRole: 'owner', canInvite: true });

    workspace.switchWorkspace('w3');

    expect(workspace.members().length).toBe(7);
    expect(workspace.currentUser()?.role).toBe('guest');
    expect(workspace.access()).toMatchObject({ canInvite: false, canCreateTeams: false });
    expect(workspace.teams()).toEqual([]);
    expect(workspace.status()).toBe('empty');
  });

  it('summarises every workspace with its member count and my role', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    expect(
      workspace.summaries().map(({ name, memberCount, myRole }) => [name, memberCount, myRole]),
    ).toEqual([
      ['Northstar Labs', 48, 'owner'],
      ['Orbit Studio', 12, 'admin'],
      ['Kite Ventures', 7, 'guest'],
    ]);
  });

  it('changes roles but never your own or the last owner', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    const admin = TestBed.inject(WorkspaceAdminState);
    await settle();

    expect(await admin.setRole('u1', 'admin')).toBe(true);
    expect(workspace.user('u1')?.role).toBe('admin');
    expect(await admin.setRole('u0', 'member')).toBe(false);

    workspace.switchWorkspace('w2');

    expect(await admin.setRole('u5', 'member')).toBe(false);
  });
});
