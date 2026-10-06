import { WorkspaceRole } from './user';
import { InvitePolicy } from './workspace';

export type Permission =
  | 'workspace.manage'
  | 'workspace.delete'
  | 'integrations.manage'
  | 'members.invite'
  | 'members.manage'
  | 'roles.manage'
  | 'audit.view'
  | 'teams.create'
  | 'teams.manage'
  | 'channels.create'
  | 'tasks.create'
  | 'tasks.deleteAny'
  | 'files.manageAny';

export type ResourcePermission = 'tasks.delete' | 'files.manage';

export type CheckedPermission = Permission | ResourcePermission;

export type PermissionGroup = 'Workspace' | 'Members' | 'Teams & channels' | 'Tasks & files';

export interface PermissionDetails {
  readonly id: Permission;
  readonly group: PermissionGroup;
  readonly label: string;
  readonly ownerOnly: boolean;
}

export type ConfigurableRole = Exclude<WorkspaceRole, 'owner'>;

export type RolePermissions = Readonly<Record<ConfigurableRole, readonly Permission[]>>;

export type RolePermissionMap = Readonly<Record<string, RolePermissions>>;

export const INVITE_PERMISSION: Permission = 'members.invite';

const permission = (
  id: Permission,
  group: PermissionGroup,
  label: string,
  ownerOnly = false,
): PermissionDetails => ({ id, group, label, ownerOnly });

export const PERMISSIONS: readonly PermissionDetails[] = [
  permission('workspace.manage', 'Workspace', 'Manage workspace settings'),
  permission('workspace.delete', 'Workspace', 'Archive, delete or transfer the workspace', true),
  permission('integrations.manage', 'Workspace', 'Manage integrations'),
  permission('members.invite', 'Members', 'Invite people'),
  permission('members.manage', 'Members', 'Change roles and remove members'),
  permission('roles.manage', 'Members', 'Edit role permissions'),
  permission('audit.view', 'Members', 'View the audit log'),
  permission('teams.create', 'Teams & channels', 'Create teams'),
  permission('teams.manage', 'Teams & channels', 'Manage any team'),
  permission('channels.create', 'Teams & channels', 'Create channels'),
  permission('tasks.create', 'Tasks & files', 'Create tasks'),
  permission('tasks.deleteAny', 'Tasks & files', 'Delete any task'),
  permission('files.manageAny', 'Tasks & files', 'Rename or delete any file'),
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: PERMISSIONS.filter((details) => !details.ownerOnly).map((details) => details.id),
  member: ['members.invite', 'teams.create', 'channels.create', 'tasks.create'],
  guest: [],
};

const NEVER_FOR_MEMBERS: readonly Permission[] = [
  'workspace.delete',
  'roles.manage',
  'members.manage',
  'audit.view',
];

export const LOCKED_PERMISSIONS: RolePermissions = {
  admin: ['workspace.delete'],
  member: NEVER_FOR_MEMBERS,
  guest: [
    ...NEVER_FOR_MEMBERS,
    'workspace.manage',
    'integrations.manage',
    'teams.manage',
    'tasks.deleteAny',
    'files.manageAny',
    'members.invite',
  ],
};

export const permissionLabelOf = (id: Permission): string =>
  PERMISSIONS.find((details) => details.id === id)?.label ?? id;

export const isLockedPermission = (role: WorkspaceRole, id: Permission): boolean =>
  role === 'owner' || LOCKED_PERMISSIONS[role].includes(id);

export const withPermission = (
  granted: readonly Permission[],
  id: Permission,
  allowed: boolean,
): readonly Permission[] => {
  if (!allowed) {
    return granted.filter((candidate) => candidate !== id);
  }
  return granted.includes(id) ? granted : [...granted, id];
};

export const withInvitePolicy = (
  permissions: RolePermissions,
  policy: InvitePolicy,
): RolePermissions => ({
  ...permissions,
  member: withPermission(permissions.member, INVITE_PERMISSION, policy === 'everyone'),
});

export const initialRolePermissions = (policy: InvitePolicy): RolePermissions => ({
  ...DEFAULT_ROLE_PERMISSIONS,
  member: DEFAULT_ROLE_PERMISSIONS.member.filter(
    (id) => id !== INVITE_PERMISSION || policy === 'everyone',
  ),
});
