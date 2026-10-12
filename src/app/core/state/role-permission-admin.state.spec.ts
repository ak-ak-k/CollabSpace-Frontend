import { TestBed } from '@angular/core/testing';
import { ActivityLogState } from './activity-log.state';
import { RolePermissionAdminState } from './role-permission-admin.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceState } from './workspace.state';

describe('RolePermissionAdminState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const load = async () => {
    const workspace = TestBed.inject(WorkspaceState);
    const rolePermissions = TestBed.inject(RolePermissionAdminState);
    await settle();
    return { workspace, rolePermissions };
  };

  it('toggles a role permission, keeps who can invite in sync and audits it', async () => {
    const { workspace, rolePermissions } = await load();
    const activity = TestBed.inject(ActivityLogState);

    expect(await rolePermissions.toggle('member', 'members.invite')).toBe(true);

    expect(workspace.rolePermissions().member).not.toContain('members.invite');
    expect(workspace.preferences()?.whoCanInvite).toBe('admins');
    expect(activity.events()[0]).toMatchObject({
      kind: 'permission',
      verb: 'turned off “Invite people” for',
      object: 'Members',
      change: { from: 'Allowed', to: 'Not allowed' },
    });
    expect(await rolePermissions.toggle('owner', 'tasks.create')).toBe(false);
    expect(await rolePermissions.toggle('member', 'roles.manage')).toBe(false);
  });

  it('restores a permission in the workspace it was changed in after a switch', async () => {
    const { workspace, rolePermissions } = await load();
    await rolePermissions.set('member', 'teams.create', false, 'w1');
    workspace.switchWorkspace('w2');

    await rolePermissions.set('member', 'teams.create', true, 'w1');

    expect(workspace.rolePermissions().member).toContain('teams.create');
    expect(workspace.rolePermissionMap()['w1'].member).toContain('teams.create');
  });

  it('refuses to change permissions where you cannot manage roles', async () => {
    const { workspace, rolePermissions } = await load();
    workspace.putRoster('w1', { ...workspace.rosters()['w1'], u0: 'member' });

    expect(await rolePermissions.set('member', 'teams.create', false, 'w1')).toBe(false);
    expect(workspace.rolePermissions().member).toContain('teams.create');
  });
});
