import { FileItem } from '../models/file-item';
import { CheckedPermission, Permission, RolePermissions } from '../models/permission';
import { Task } from '../models/task';
import { Team } from '../models/team';
import { WorkspaceRole } from '../models/user';

export interface PermissionSubject {
  readonly userId: string;
  readonly role: WorkspaceRole;
  readonly rolePermissions: RolePermissions;
}

export type PermissionResource =
  | { readonly task: Pick<Task, 'reporterId' | 'assigneeId'> }
  | { readonly file: Pick<FileItem, 'ownerId'> }
  | { readonly team: Pick<Team, 'ownerId' | 'adminIds'> };

const grantedTo = ({ role, rolePermissions }: PermissionSubject): readonly Permission[] =>
  role === 'owner' ? [] : rolePermissions[role];

const holds = (subject: PermissionSubject, permission: CheckedPermission): boolean =>
  grantedTo(subject).some((granted) => granted === permission);

const canUseResource = (
  subject: PermissionSubject,
  permission: CheckedPermission,
  resource: PermissionResource,
): boolean | null => {
  const { userId, role } = subject;
  if ('task' in resource && permission === 'tasks.delete') {
    const { reporterId, assigneeId } = resource.task;
    const involved = reporterId === userId || assigneeId === userId;
    return role !== 'guest' && (involved || holds(subject, 'tasks.deleteAny'));
  }
  if ('file' in resource && permission === 'files.manage') {
    const owns = resource.file.ownerId === userId;
    return role !== 'guest' && (owns || holds(subject, 'files.manageAny'));
  }
  if ('team' in resource && permission === 'teams.manage') {
    const { ownerId, adminIds } = resource.team;
    return ownerId === userId || adminIds.includes(userId) || holds(subject, 'teams.manage');
  }
  return null;
};

export const allows = (
  subject: PermissionSubject,
  permission: CheckedPermission,
  resource?: PermissionResource,
): boolean => {
  if (subject.role === 'owner') {
    return true;
  }
  if (permission === 'workspace.delete') {
    return false;
  }
  const resourceAnswer = resource ? canUseResource(subject, permission, resource) : null;
  return resourceAnswer ?? holds(subject, permission);
};
