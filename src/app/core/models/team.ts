import { WorkspaceRole } from './user';

export type TeamActivityLevel = 'Very active' | 'Active' | 'Moderate' | 'Quiet' | 'New';

export type TeamPrivacy = 'public' | 'private';

export interface Team {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly memberIds: readonly string[];
  readonly leadId: string;
  readonly channelIds: readonly string[];
  readonly activityLevel: TeamActivityLevel;
  readonly weeklyMessageCount: number;
  readonly createdLabel: string;
  readonly joined: boolean;
  readonly isPrivate: boolean;
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
