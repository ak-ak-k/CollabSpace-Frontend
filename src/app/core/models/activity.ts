import { IconName } from '../../shared/ui/icon/icon-registry';
import { ActivityAction } from './activity-action';
import { WorkspaceRole } from './user';
import { WorkspaceScoped } from './workspace';

export type TeamActivityKind =
  'code' | 'pin' | 'file' | 'task' | 'deploy' | 'comment' | 'zap' | 'hash';

export type WorkspaceActivityKind =
  | 'invite'
  | 'join'
  | 'leave'
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

export type ActivityOutcome = 'succeeded' | 'pending' | 'failed';

export type ActivityPrivacy = 'Private' | 'Public';

export interface ActivityEntity {
  readonly type: ActivityEntityType;
  readonly id: string;
}

export interface ActivityChange {
  readonly from: string;
  readonly to: string;
}

export interface ActivityMeta {
  readonly role?: WorkspaceRole;
  readonly team?: string | null;
  readonly count?: number;
  readonly privacy?: ActivityPrivacy;
  readonly deleteOn?: string;
  readonly setting?: string;
  readonly permission?: string;
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
  readonly action: ActivityAction;
  readonly meta: ActivityMeta | null;
  readonly outcome: ActivityOutcome;
  readonly audit: boolean;
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
  readonly action?: ActivityAction;
  readonly meta?: ActivityMeta | null;
  readonly outcome?: ActivityOutcome;
  readonly audit?: boolean;
}

export type ActivityRecordFields = Pick<ActivityEvent, 'action' | 'meta' | 'outcome' | 'audit'>;

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
  leave: 'user-minus',
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
  leave: 'members',
  workspace: 'members',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityGroup, string> = {
  tasks: 'Task',
  teams: 'Team',
  files: 'File',
  members: 'Member',
};

export const ACTIVITY_OUTCOME_LABELS: Record<ActivityOutcome, string> = {
  succeeded: 'Succeeded',
  pending: 'Pending sync',
  failed: 'Failed',
};

const LEGACY_ACTIONS: Record<ActivityKind, ActivityAction> = {
  code: 'integration.event',
  pin: 'message.pinned',
  file: 'file.updated',
  task: 'task.updated',
  deploy: 'integration.event',
  comment: 'task.commented',
  zap: 'integration.event',
  hash: 'channel.created',
  invite: 'invite.sent',
  join: 'member.joined',
  leave: 'member.left',
  channel: 'channel.created',
  team: 'team.updated',
  role: 'member.role_changed',
  integration: 'integration.connected',
  security: 'security.setting_changed',
  remove: 'member.removed',
  workspace: 'workspace.updated',
  archive: 'workspace.archived',
  permission: 'role.permission_changed',
  'workspace-settings': 'workspace.updated',
  deletion: 'workspace.deletion_scheduled',
};

const TEAM_OBJECT_PREFIX = 'the ';

export const legacyActionOf = (kind: ActivityKind, object: string): ActivityAction =>
  kind === 'join' && object.startsWith(TEAM_OBJECT_PREFIX)
    ? 'team.member_joined'
    : LEGACY_ACTIONS[kind];

export const settledRecordFields = (kind: ActivityKind, object: string): ActivityRecordFields => ({
  action: legacyActionOf(kind, object),
  meta: null,
  outcome: 'succeeded',
  audit: false,
});

export const isAuditEvent = (event: Pick<ActivityEvent, 'category' | 'audit'>): boolean =>
  event.category === 'audit' || event.audit;

export const activityIconOf = (kind: ActivityKind): IconName => ACTIVITY_ICONS[kind] ?? 'activity';

export const activityChangeText = (change: ActivityChange | null): string =>
  change ? `${change.from} → ${change.to}` : '';
