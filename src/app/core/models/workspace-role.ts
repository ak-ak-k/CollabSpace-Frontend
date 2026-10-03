import { WorkspaceRole } from './user';

export interface WorkspaceRoleDetails {
  readonly role: WorkspaceRole;
  readonly label: string;
  readonly summary: string;
  readonly description: string;
}

export const WORKSPACE_ROLE_DETAILS: readonly WorkspaceRoleDetails[] = [
  {
    role: 'owner',
    label: 'Owner',
    summary: 'Full workspace access',
    description: 'Full workspace access, including billing, security and deleting the workspace.',
  },
  {
    role: 'admin',
    label: 'Admin',
    summary: 'Manage workspace and members',
    description: 'Manage workspace settings, members, roles and teams.',
  },
  {
    role: 'member',
    label: 'Member',
    summary: 'Normal workspace access',
    description:
      'Join and create teams and channels, message anyone, and invite people when allowed.',
  },
  {
    role: 'guest',
    label: 'Guest',
    summary: 'Limited access',
    description:
      'Only sees the teams and channels they’re added to. Can’t invite people or create teams.',
  },
];

export const WORKSPACE_ROLES: readonly WorkspaceRole[] = WORKSPACE_ROLE_DETAILS.map(
  (details) => details.role,
);

export const WORKSPACE_ROLE_LABELS = Object.fromEntries(
  WORKSPACE_ROLE_DETAILS.map((details) => [details.role, details.label]),
) as Record<WorkspaceRole, string>;

export const workspaceRoleRank = (role: WorkspaceRole): number => WORKSPACE_ROLES.indexOf(role);

export const isWorkspaceManager = (role: WorkspaceRole): boolean =>
  role === 'owner' || role === 'admin';

export const ownerCountOf = (roster: Readonly<Record<string, WorkspaceRole>>): number =>
  Object.values(roster).filter((role) => role === 'owner').length;

export const canChangeRole = (
  roster: Readonly<Record<string, WorkspaceRole>>,
  userId: string,
  role: WorkspaceRole,
  actorId: string,
): boolean => {
  const current = roster[userId];
  const losesLastOwner = current === 'owner' && ownerCountOf(roster) < 2;
  return !!current && current !== role && userId !== actorId && !losesLastOwner;
};

export const roleWithArticle = (role: WorkspaceRole): string =>
  `${isWorkspaceManager(role) ? 'an' : 'a'} ${WORKSPACE_ROLE_LABELS[role]}`;
