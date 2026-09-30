import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
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
    expect(workspace.onlineUserCount()).toBe(6);
  });

  it('updates presence for the current user', async () => {
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    await workspace.setPresence('dnd');

    expect(workspace.currentUser()?.status).toBe('dnd');
    expect(workspace.onlineUserCount()).toBe(5);
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
});
