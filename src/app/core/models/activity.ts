import { IconName } from '../../shared/ui/icon/icon-registry';

export type ActivityKind = 'code' | 'pin' | 'file' | 'task' | 'deploy' | 'comment' | 'zap' | 'hash';

export interface ActivityEvent {
  readonly id: string;
  readonly actorId: string;
  readonly verb: string;
  readonly object: string;
  readonly occurredAt: number;
  readonly teamId: string;
  readonly kind: ActivityKind;
  readonly route: string;
}

export const ACTIVITY_ICONS: Record<ActivityKind, IconName> = {
  code: 'git-pull-request',
  pin: 'pin',
  file: 'file-text',
  task: 'square-kanban',
  deploy: 'rocket',
  comment: 'message-circle',
  zap: 'zap',
  hash: 'hash',
};
