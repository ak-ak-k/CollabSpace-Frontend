import {
  DEFAULT_ROLE_PERMISSIONS,
  Permission,
  PermissionDetails,
  PERMISSIONS,
} from '../../../core/models/permission';
import {
  permissionCellOf,
  permissionRowsOf,
  permissionToggleMessageOf,
  rolePermissionListOf,
} from './role-permissions-view';

const detailsOf = (id: Permission): PermissionDetails =>
  PERMISSIONS.find((details) => details.id === id) ?? PERMISSIONS[0];

describe('role permissions view', () => {
  it('builds one row per permission with a cell per role', () => {
    const rows = permissionRowsOf(DEFAULT_ROLE_PERMISSIONS, true);

    expect(rows.length).toBe(13);
    expect(rows[0].cells.map((cell) => cell.role)).toEqual(['owner', 'admin', 'member', 'guest']);
    expect(rows.every((row) => row.cells[0].allowed && row.cells[0].locked)).toBe(true);
  });

  it('locks owner, owner-only and unavailable cells with the reason as the hint', () => {
    const owner = permissionCellOf(
      'owner',
      detailsOf('tasks.create'),
      DEFAULT_ROLE_PERMISSIONS,
      true,
    );
    const ownerOnly = permissionCellOf(
      'admin',
      detailsOf('workspace.delete'),
      DEFAULT_ROLE_PERMISSIONS,
      true,
    );
    const guest = permissionCellOf(
      'guest',
      detailsOf('roles.manage'),
      DEFAULT_ROLE_PERMISSIONS,
      true,
    );

    expect(owner).toMatchObject({ editable: false, hint: 'Owners always have every permission' });
    expect(ownerOnly).toMatchObject({ allowed: false, hint: 'Only Owners can do this' });
    expect(guest.hint).toBe('Not available for Guests');
    expect(guest.label).toBe('Guest — Edit role permissions: not allowed (locked)');
  });

  it('describes editable cells and what toggling them does', () => {
    const cell = permissionCellOf(
      'member',
      detailsOf('tasks.create'),
      DEFAULT_ROLE_PERMISSIONS,
      true,
    );

    expect(cell).toMatchObject({ allowed: true, locked: false, editable: true });
    expect(cell.label).toBe('Member — Create tasks: allowed');
    expect(cell.hint).toBe('Allowed — click to remove');
    expect(permissionToggleMessageOf(cell)).toBe('Members can no longer create tasks');
    expect(
      permissionCellOf('member', detailsOf('tasks.create'), DEFAULT_ROLE_PERMISSIONS, false)
        .editable,
    ).toBe(false);
  });

  it('lists what a role can do for the role cards', () => {
    const admin = rolePermissionListOf('admin', DEFAULT_ROLE_PERMISSIONS);

    expect(admin.find((item) => item.id === 'workspace.delete')?.allowed).toBe(false);
    expect(admin.find((item) => item.id === 'roles.manage')?.allowed).toBe(true);
  });
});
