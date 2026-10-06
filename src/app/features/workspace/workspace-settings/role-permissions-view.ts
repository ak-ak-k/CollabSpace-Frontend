import {
  isLockedPermission,
  Permission,
  PermissionDetails,
  permissionLabelOf,
  PERMISSIONS,
  RolePermissions,
} from '../../../core/models/permission';
import { WorkspaceRole } from '../../../core/models/user';
import { WORKSPACE_ROLE_LABELS, WORKSPACE_ROLES } from '../../../core/models/workspace-role';

export interface PermissionCellView {
  readonly role: WorkspaceRole;
  readonly permission: Permission;
  readonly allowed: boolean;
  readonly locked: boolean;
  readonly editable: boolean;
  readonly label: string;
  readonly hint: string;
}

export interface PermissionRowView {
  readonly id: Permission;
  readonly label: string;
  readonly cells: readonly PermissionCellView[];
}

export interface RolePermissionView {
  readonly id: Permission;
  readonly label: string;
  readonly allowed: boolean;
}

const ALLOWED_HINT = 'Allowed — click to remove';
const NOT_ALLOWED_HINT = 'Not allowed — click to allow';

const pluralRoleOf = (role: WorkspaceRole): string => `${WORKSPACE_ROLE_LABELS[role]}s`;

export const roleHasPermission = (
  role: WorkspaceRole,
  details: PermissionDetails,
  rolePermissions: RolePermissions,
): boolean =>
  role === 'owner' || (!details.ownerOnly && rolePermissions[role].includes(details.id));

const lockReasonOf = (role: WorkspaceRole, details: PermissionDetails): string | null => {
  if (role === 'owner') {
    return 'Owners always have every permission';
  }
  if (details.ownerOnly) {
    return 'Only Owners can do this';
  }
  return isLockedPermission(role, details.id) ? `Not available for ${pluralRoleOf(role)}` : null;
};

export const permissionCellOf = (
  role: WorkspaceRole,
  details: PermissionDetails,
  rolePermissions: RolePermissions,
  canEdit: boolean,
): PermissionCellView => {
  const allowed = roleHasPermission(role, details, rolePermissions);
  const lockReason = lockReasonOf(role, details);
  const locked = lockReason !== null;
  const state = allowed ? 'allowed' : 'not allowed';
  return {
    role,
    permission: details.id,
    allowed,
    locked,
    editable: canEdit && !locked,
    label: `${WORKSPACE_ROLE_LABELS[role]} — ${details.label}: ${state}${locked ? ' (locked)' : ''}`,
    hint: lockReason ?? (allowed ? ALLOWED_HINT : NOT_ALLOWED_HINT),
  };
};

export const permissionRowsOf = (
  rolePermissions: RolePermissions,
  canEdit: boolean,
): readonly PermissionRowView[] =>
  PERMISSIONS.map((details) => ({
    id: details.id,
    label: details.label,
    cells: WORKSPACE_ROLES.map((role) => permissionCellOf(role, details, rolePermissions, canEdit)),
  }));

export const rolePermissionListOf = (
  role: WorkspaceRole,
  rolePermissions: RolePermissions,
): readonly RolePermissionView[] =>
  PERMISSIONS.map((details) => ({
    id: details.id,
    label: details.label,
    allowed: roleHasPermission(role, details, rolePermissions),
  }));

export const permissionToggleMessageOf = ({
  role,
  permission,
  allowed,
}: PermissionCellView): string =>
  `${pluralRoleOf(role)} ${allowed ? 'can no longer' : 'can now'} ${permissionLabelOf(permission).toLowerCase()}`;
