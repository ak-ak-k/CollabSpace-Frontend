import { IconName } from '../../shared/ui/icon/icon-registry';
import { WorkspaceScoped } from './workspace';

export type TeamActivityKind =
  'code' | 'pin' | 'file' | 'task' | 'deploy' | 'comment' | 'zap' | 'hash';

export type WorkspaceActivityKind =
  | 'invite'
  | 'join'
  | 'channel'
  | 'team'
  | 'role'
  | 'integration'
  | 'security'
  | 'remove'
  | 'workspace'
  | 'archive'
  | 'permission'
  | 'workspace-settings'
  | 'deletion';

export type ActivityKind = TeamActivityKind | WorkspaceActivityKind;

export type ActivityCategory = 'activity' | 'audit';

export type ActivityEntityType = 'task' | 'file' | 'team' | 'channel' | 'member';

export type ActivityGroup = 'tasks' | 'files' | 'teams' | 'members';

export interface ActivityEntity {
  readonly type: ActivityEntityType;
  readonly id: string;
}

export interface ActivityChange {
  readonly from: string;
  readonly to: string;
}

export interface ActivityEvent extends WorkspaceScoped {
  readonly id: string;
  readonly actorId: string;
  readonly verb: string;
  readonly object: string;
  readonly occurredAt: number;
  readonly kind: ActivityKind;
  readonly route: string;
  readonly category: ActivityCategory;
  readonly entity: ActivityEntity | null;
  readonly teamId: string | null;
  readonly change: ActivityChange | null;
}

export interface ActivityEntry {
  readonly kind: ActivityKind;
  readonly verb: string;
  readonly object: string;
  readonly route: string;
  readonly category?: ActivityCategory;
  readonly entity?: ActivityEntity | null;
  readonly teamId?: string | null;
  readonly change?: ActivityChange | null;
}

export const AUDIT_KINDS: ReadonlySet<ActivityKind> = new Set<ActivityKind>([
  'invite',
  'role',
  'remove',
  'archive',
  'security',
  'integration',
  'permission',
  'workspace-settings',
  'deletion',
]);

export const activityCategoryOf = (
  kind: ActivityKind,
  category?: ActivityCategory,
): ActivityCategory => category ?? (AUDIT_KINDS.has(kind) ? 'audit' : 'activity');

export const ACTIVITY_ICONS: Record<ActivityKind, IconName> = {
  code: 'git-pull-request',
  pin: 'pin',
  file: 'file-text',
  task: 'square-kanban',
  deploy: 'rocket',
  comment: 'message-circle',
  zap: 'zap',
  hash: 'hash',
  invite: 'mail-plus',
  join: 'user-plus',
  channel: 'hash',
  team: 'users',
  role: 'shield-check',
  integration: 'plug',
  security: 'shield-check',
  remove: 'user-minus',
  workspace: 'building-2',
  archive: 'archive',
  permission: 'key-round',
  'workspace-settings': 'settings',
  deletion: 'trash-2',
};

export const ACTIVITY_GROUPS: Partial<Record<ActivityKind, ActivityGroup>> = {
  task: 'tasks',
  comment: 'tasks',
  file: 'files',
  team: 'teams',
  channel: 'teams',
  pin: 'teams',
  code: 'teams',
  deploy: 'teams',
  zap: 'teams',
  join: 'members',
  workspace: 'members',
};

export const activityIconOf = (kind: ActivityKind): IconName => ACTIVITY_ICONS[kind] ?? 'activity';

export const activityChangeText = (change: ActivityChange | null): string =>
  change ? `${change.from} → ${change.to}` : '';
