import {
  DEFAULT_ROLE_PERMISSIONS,
  initialRolePermissions,
  isLockedPermission,
  PERMISSIONS,
  withInvitePolicy,
} from './permission';

describe('permissions', () => {
  it('lists every permission once, with workspace deletion owner-only', () => {
    expect(PERMISSIONS).toHaveLength(13);
    expect(new Set(PERMISSIONS.map((details) => details.id)).size).toBe(13);
    expect(PERMISSIONS.filter((details) => details.ownerOnly).map((details) => details.id)).toEqual(
      ['workspace.delete'],
    );
  });

  it('gives admins everything except deletion, members the basics and guests nothing', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.admin).toHaveLength(12);
    expect(DEFAULT_ROLE_PERMISSIONS.admin).not.toContain('workspace.delete');
    expect(DEFAULT_ROLE_PERMISSIONS.member).toEqual([
      'members.invite',
      'teams.create',
      'channels.create',
      'tasks.create',
    ]);
    expect(DEFAULT_ROLE_PERMISSIONS.guest).toEqual([]);
  });

  it('lets members invite only when the workspace allows everyone to invite', () => {
    expect(initialRolePermissions('everyone').member).toContain('members.invite');
    expect(initialRolePermissions('admins').member).not.toContain('members.invite');
    expect(withInvitePolicy(initialRolePermissions('admins'), 'everyone').member).toContain(
      'members.invite',
    );
  });

  it('locks owner cells and cells a role can never have', () => {
    expect(isLockedPermission('owner', 'tasks.create')).toBe(true);
    expect(isLockedPermission('admin', 'workspace.delete')).toBe(true);
    expect(isLockedPermission('member', 'roles.manage')).toBe(true);
    expect(isLockedPermission('guest', 'members.invite')).toBe(true);
    expect(isLockedPermission('guest', 'tasks.create')).toBe(false);
  });
});
