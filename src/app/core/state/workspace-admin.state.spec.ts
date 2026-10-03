import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceAdminState } from './workspace-admin.state';
import { WorkspaceState } from './workspace.state';

describe('WorkspaceAdminState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const load = async () => {
    const workspace = TestBed.inject(WorkspaceState);
    const admin = TestBed.inject(WorkspaceAdminState);
    await settle();
    return { workspace, admin };
  };

  it('creates a workspace, makes you its owner and switches to it', async () => {
    const { workspace, admin } = await load();

    const created = await admin.createWorkspace({
      name: 'Acme Technologies',
      slug: 'acme-technologies',
      description: '',
    });

    expect(created).toMatchObject({ code: 'AT', plan: 'Free' });
    expect(workspace.currentWorkspaceId()).toBe(created.id);
    expect(workspace.access()).toMatchObject({ myRole: 'owner', isOwner: true });
    expect(workspace.members().length).toBe(1);
    expect(admin.isSlugInUse('acme-technologies')).toBe(true);
  });

  it('archives and schedules deletion of the current workspace', async () => {
    const { workspace, admin } = await load();

    await admin.setArchived(true);
    await admin.scheduleDeletion(true);

    expect(workspace.isArchived()).toBe(true);
    expect(workspace.currentWorkspace()?.deleteAt).toBeGreaterThan(Date.now());

    await admin.scheduleDeletion(false);

    expect(workspace.currentWorkspace()?.deleteAt).toBeNull();
  });

  it('removes a member and can bring them back with the same role', async () => {
    const { workspace, admin } = await load();

    const role = await admin.removeMember('u4');

    expect(role).toBe('admin');
    expect(workspace.memberIds().has('u4')).toBe(false);
    expect(await admin.removeMember('u0')).toBeNull();

    await admin.restoreMember('u4', 'admin');

    expect(workspace.user('u4')?.role).toBe('admin');
    expect(workspace.members().length).toBe(48);
  });
});
