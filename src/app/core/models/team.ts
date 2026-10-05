import { WorkspaceRole } from './user';

export type TeamActivityLevel = 'Very active' | 'Active' | 'Moderate' | 'Quiet' | 'New';

export type TeamPrivacy = 'public' | 'private';

export type TeamRole = 'owner' | 'admin' | 'member';

export type AssignableTeamRole = Exclude<TeamRole, 'owner'>;

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

export interface Team {
  readonly workspaceId: string;
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly memberIds: readonly string[];
  readonly leadId: string;
  readonly ownerId: string;
  readonly adminIds: readonly string[];
  readonly channelIds: readonly string[];
  readonly activityLevel: TeamActivityLevel;
  readonly weeklyMessageCount: number;
  readonly createdLabel: string;
  readonly joined: boolean;
  readonly isPrivate: boolean;
  readonly archived: boolean;
}

export interface TeamMember {
  readonly userId: string;
  readonly teamId: string;
  readonly role: WorkspaceRole;
}

export interface NewTeam {
  readonly name: string;
  readonly description: string;
  readonly privacy: TeamPrivacy;
}

export interface TeamChanges {
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean;
}
