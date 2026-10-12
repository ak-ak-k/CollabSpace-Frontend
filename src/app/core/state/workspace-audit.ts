import { ActivityChange, ActivityEntity, ActivityEntry } from '../models/activity';
import { ConfigurableRole, Permission, permissionLabelOf } from '../models/permission';
import { User, WorkspaceRole } from '../models/user';
import { formatDate } from '../../shared/pipes/time-format';
import { Workspace, WorkspaceChanges } from '../models/workspace';
import { roleWithArticle, WORKSPACE_ROLE_LABELS } from '../models/workspace-role';

type AuditedMember = Pick<User, 'id' | 'name'>;

const SETTINGS_ROUTE = '/workspace/settings';
const GENERAL_ROUTE = `${SETTINGS_ROUTE}/general`;
const DANGER_ROUTE = `${SETTINGS_ROUTE}/danger`;
const ROLES_ROUTE = `${SETTINGS_ROUTE}/roles`;
const MEMBERS_ROUTE = '/workspace/members';
const ADMINS_ROUTE = `${MEMBERS_ROUTE}/admins`;
const ALLOWED = 'Allowed';
const NOT_ALLOWED = 'Not allowed';
const WORKSPACE_OBJECT = 'the workspace';
const DELETE_ON_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

const memberEntity = (member: AuditedMember): ActivityEntity => ({ type: 'member', id: member.id });

export const workspaceDetailsEntry = (
  current: Workspace,
  changes: WorkspaceChanges,
): ActivityEntry | null => {
  const renamed = !!changes.name && changes.name !== current.name;
  const slugChanged = !!changes.slug && changes.slug !== current.slug;
  const describedChanged =
    changes.description !== undefined && changes.description !== current.description;
  if (!renamed && !slugChanged && !describedChanged) {
    return null;
  }
  return {
    kind: 'workspace-settings',
    verb: renamed ? 'renamed the workspace' : 'updated workspace details',
    object: renamed ? `to ${changes.name}` : '',
    route: GENERAL_ROUTE,
    action: renamed ? 'workspace.renamed' : 'workspace.updated',
    change: renamed
      ? { from: current.name, to: changes.name ?? '' }
      : slugChanged
        ? { from: current.slug, to: changes.slug ?? '' }
        : null,
  };
};

export const workspaceLogoEntry = (logoUrl: string | null): ActivityEntry => ({
  kind: 'workspace-settings',
  verb: logoUrl ? 'changed the workspace logo' : 'removed the workspace logo',
  object: '',
  route: GENERAL_ROUTE,
  action: logoUrl ? 'workspace.logo_changed' : 'workspace.logo_removed',
});

export const workspaceArchiveEntry = (archived: boolean): ActivityEntry => ({
  kind: 'archive',
  verb: archived ? 'archived' : 'unarchived',
  object: WORKSPACE_OBJECT,
  route: DANGER_ROUTE,
  action: archived ? 'workspace.archived' : 'workspace.unarchived',
});

export const workspaceDeletionEntry = (deleteAt: number | null): ActivityEntry => ({
  kind: 'deletion',
  verb: deleteAt ? 'scheduled deletion of' : 'cancelled deletion of',
  object: WORKSPACE_OBJECT,
  route: DANGER_ROUTE,
  action: deleteAt ? 'workspace.deletion_scheduled' : 'workspace.deletion_cancelled',
  meta: deleteAt ? { deleteOn: formatDate(deleteAt, DELETE_ON_FORMAT) } : null,
});

export const roleChangeEntry = (
  member: AuditedMember,
  from: WorkspaceRole,
  to: WorkspaceRole,
): ActivityEntry => ({
  kind: 'role',
  verb: 'made',
  object: `${member.name} ${roleWithArticle(to)}`,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
  action: 'member.role_changed',
  change: { from: WORKSPACE_ROLE_LABELS[from], to: WORKSPACE_ROLE_LABELS[to] },
});

export const ownershipTransferEntry = (
  member: AuditedMember,
  previousOwnerName: string,
): ActivityEntry => ({
  kind: 'role',
  verb: 'transferred ownership to',
  object: member.name,
  route: ADMINS_ROUTE,
  entity: memberEntity(member),
  action: 'workspace.ownership_transferred',
  change: { from: previousOwnerName, to: member.name },
});

export const memberRemovedEntry = (member: AuditedMember, role: WorkspaceRole): ActivityEntry => ({
  kind: 'remove',
  verb: 'removed',
  object: member.name,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
  action: 'member.removed',
  meta: { role },
});

export const memberRestoredEntry = (member: AuditedMember, role: WorkspaceRole): ActivityEntry => ({
  kind: 'remove',
  verb: 'restored',
  object: `${member.name} to the workspace`,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
  action: 'member.restored',
  meta: { role },
});

const permissionChangeOf = (allowed: boolean): ActivityChange =>
  allowed ? { from: NOT_ALLOWED, to: ALLOWED } : { from: ALLOWED, to: NOT_ALLOWED };

export const permissionChangeEntry = (
  permission: Permission,
  role: ConfigurableRole,
  allowed: boolean,
): ActivityEntry => ({
  kind: 'permission',
  verb: `turned ${allowed ? 'on' : 'off'} “${permissionLabelOf(permission)}” for`,
  object: `${WORKSPACE_ROLE_LABELS[role]}s`,
  route: ROLES_ROUTE,
  action: 'role.permission_changed',
  meta: { role, permission },
  change: permissionChangeOf(allowed),
});
