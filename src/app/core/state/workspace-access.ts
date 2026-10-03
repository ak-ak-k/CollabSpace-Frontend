import { Conversation } from '../models/conversation';
import { User, WorkspaceRole } from '../models/user';
import {
  Workspace,
  WorkspaceAccess,
  WorkspacePreferences,
  WorkspaceRoster,
  WorkspaceRosters,
  WorkspaceSummary,
} from '../models/workspace';
import { isWorkspaceManager } from '../models/workspace-role';

const OUTSIDER_ROLE: WorkspaceRole = 'guest';

export const roleIn = (roster: WorkspaceRoster | undefined, userId: string): WorkspaceRole =>
  roster?.[userId] ?? OUTSIDER_ROLE;

export const withRosterRole = (user: User, roster: WorkspaceRoster): User => {
  const role = roster[user.id];
  return role && role !== user.role ? { ...user, role } : user;
};

export const accessOf = (
  myRole: WorkspaceRole,
  preferences: WorkspacePreferences | null,
): WorkspaceAccess => {
  const canManage = isWorkspaceManager(myRole);
  const membersMayInvite = myRole === 'member' && preferences?.whoCanInvite === 'everyone';
  return {
    myRole,
    canManage,
    isOwner: myRole === 'owner',
    canInvite: canManage || membersMayInvite,
    canCreateTeams: myRole !== 'guest',
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
