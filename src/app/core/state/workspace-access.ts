import { Conversation } from '../models/conversation';
import {
  initialRolePermissions,
  Permission,
  RolePermissionMap,
  RolePermissions,
} from '../models/permission';
import { User, WorkspaceRole } from '../models/user';
import {
  Workspace,
  WorkspaceAccess,
  WorkspacePreferences,
  WorkspaceRoster,
  WorkspaceRosters,
  WorkspaceSummary,
} from '../models/workspace';
import { allows, PermissionSubject } from './permission-check';

const OUTSIDER_ROLE: WorkspaceRole = 'guest';

export const roleIn = (roster: WorkspaceRoster | undefined, userId: string): WorkspaceRole =>
  roster?.[userId] ?? OUTSIDER_ROLE;

export const withRosterRole = (user: User, roster: WorkspaceRoster): User => {
  const role = roster[user.id];
  return role && role !== user.role ? { ...user, role } : user;
};

export const rolePermissionsIn = (
  map: RolePermissionMap,
  workspaceId: string,
  preferences: WorkspacePreferences | null,
): RolePermissions =>
  map[workspaceId] ?? initialRolePermissions(preferences?.whoCanInvite ?? 'admins');

export const accessOf = (subject: PermissionSubject): WorkspaceAccess => {
  const holds = (permission: Permission): boolean => allows(subject, permission);
  return {
    myRole: subject.role,
    isOwner: subject.role === 'owner',
    isGuest: subject.role === 'guest',
    canManage: holds('workspace.manage'),
    canInvite: holds('members.invite'),
    canManageMembers: holds('members.manage'),
    canManageRoles: holds('roles.manage'),
    canManageIntegrations: holds('integrations.manage'),
    canCreateTeams: holds('teams.create'),
    canCreateChannels: holds('channels.create'),
    canCreateTasks: holds('tasks.create'),
    canViewAudit: holds('audit.view'),
  };
};

export const summariesOf = (
  workspaces: readonly Workspace[],
  rosters: WorkspaceRosters,
  currentId: string,
  userId: string,
): readonly WorkspaceSummary[] =>
  workspaces.map((workspace) => ({
    ...workspace,
    memberCount: Object.keys(rosters[workspace.id] ?? {}).length,
    myRole: roleIn(rosters[workspace.id], userId),
    current: workspace.id === currentId,
  }));

export const conversationInScope = (
  conversation: Conversation,
  workspaceId: string,
  teamIds: ReadonlySet<string>,
): boolean =>
  conversation.type === 'channel'
    ? teamIds.has(conversation.teamId)
    : conversation.workspaceId === workspaceId;
