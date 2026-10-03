import { WorkspaceRole } from './user';
import { WorkspaceScoped } from './workspace';

export interface WorkspaceInvite extends WorkspaceScoped {
  readonly id: string;
  readonly email: string;
  readonly role: WorkspaceRole;
  readonly invitedById: string;
  readonly invitedAt: number;
  readonly teamId: string | null;
  readonly queued: boolean;
}
