import { TestBed } from '@angular/core/testing';
import { ActivityLogState } from './activity-log.state';
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

  it('toggles a role permission, keeps who can invite in sync and audits it', async () => {
    const { workspace, admin } = await load();
    const activity = TestBed.inject(ActivityLogState);

    expect(await admin.toggleRolePermission('member', 'members.invite')).toBe(true);

    expect(workspace.rolePermissions().member).not.toContain('members.invite');
    expect(workspace.preferences()?.whoCanInvite).toBe('admins');
    expect(activity.events()[0]).toMatchObject({
      kind: 'permission',
      verb: 'turned off “Invite people” for',
      object: 'Members',
      change: { from: 'Allowed', to: 'Not allowed' },
    });
    expect(await admin.toggleRolePermission('owner', 'tasks.create')).toBe(false);
    expect(await admin.toggleRolePermission('member', 'roles.manage')).toBe(false);
  });

  it('lets members invite when the workspace allows everyone to', async () => {
    const { workspace, admin } = await load();
    workspace.switchWorkspace('w2');

    await admin.updatePreferences({ whoCanInvite: 'everyone' });

    expect(workspace.rolePermissions().member).toContain('members.invite');
  });

  it('transfers ownership to another member and makes you an admin', async () => {
    const { workspace, admin } = await load();
    const activity = TestBed.inject(ActivityLogState);
    const newOwner = workspace.user('u4');

    expect(admin.canTransferTo('u0')).toBe(false);
    expect(admin.canTransferTo('nobody')).toBe(false);
    expect(await admin.transferOwnership('u4')).toBe(true);

    expect(workspace.roster()['u4']).toBe('owner');
    expect(workspace.access()).toMatchObject({ myRole: 'admin', isOwner: false });
    expect(workspace.currentWorkspace()?.ownerId).toBe('u4');
    expect(activity.events()[0]).toMatchObject({
      kind: 'role',
      verb: 'transferred ownership to',
      object: newOwner?.name,
      entity: { type: 'member', id: 'u4' },
    });
    expect(await admin.transferOwnership('u5')).toBe(false);
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
