import { Density } from './preferences';
import { WorkspaceRole } from './user';

export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly plan: string;
  readonly slug: string;
  readonly description: string;
  readonly createdLabel: string;
  readonly ownerId: string;
  readonly domain: string;
  readonly logoUrl: string | null;
  readonly archivedAt: number | null;
  readonly deleteAt: number | null;
}

export type WorkspaceChanges = Partial<Pick<Workspace, 'name' | 'slug' | 'description'>>;

export type WorkspacePatch = Partial<Omit<Workspace, 'id' | 'code'>>;

export interface NewWorkspace {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
}

export type WorkspaceRoster = Readonly<Record<string, WorkspaceRole>>;

export type WorkspaceRosters = Readonly<Record<string, WorkspaceRoster>>;

export type InvitePolicy = 'admins' | 'everyone';

export type MemberNotificationDefault = 'all' | 'mentions' | 'nothing';

export type EmailDigest = 'daily' | 'weekly' | 'off';

export type WorkspaceThemeDefault = 'light' | 'dark' | 'system';

export type SessionLength = '24 hours' | '7 days' | '30 days' | '90 days';

export interface WorkspacePreferences {
  readonly whoCanInvite: InvitePolicy;
  readonly defaultRole: Extract<WorkspaceRole, 'member' | 'guest'>;
  readonly restrictDomains: boolean;
  readonly domains: string;
  readonly notifyDefault: MemberNotificationDefault;
  readonly digest: EmailDigest;
  readonly allowEveryone: boolean;
  readonly defaultTheme: WorkspaceThemeDefault;
  readonly defaultDensity: Density;
  readonly requireTwoFactor: boolean;
  readonly sessionLength: SessionLength;
  readonly passwordSignIn: boolean;
  readonly googleSignIn: boolean;
  readonly defaultChannelId: string;
}

export type WorkspacePreferenceMap = Readonly<Record<string, WorkspacePreferences>>;

export interface WorkspaceSummary extends Workspace {
  readonly memberCount: number;
  readonly myRole: WorkspaceRole;
  readonly current: boolean;
}

export interface WorkspaceAccess {
  readonly myRole: WorkspaceRole;
  readonly canManage: boolean;
  readonly isOwner: boolean;
  readonly canInvite: boolean;
  readonly canCreateTeams: boolean;
}

export interface WorkspaceScoped {
  readonly workspaceId: string;
}
