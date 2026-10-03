import { IconName } from '../../shared/ui/icon/icon-registry';
import { WorkspaceScoped } from './workspace';

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
  | 'archive';

export interface WorkspaceActivityEvent extends WorkspaceScoped {
  readonly id: string;
  readonly actorId: string;
  readonly verb: string;
  readonly object: string;
  readonly occurredAt: number;
  readonly kind: WorkspaceActivityKind;
  readonly route: string;
}

export const WORKSPACE_ACTIVITY_ICONS: Record<WorkspaceActivityKind, IconName> = {
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
};
