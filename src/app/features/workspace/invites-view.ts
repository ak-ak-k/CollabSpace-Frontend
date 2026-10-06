import { WorkspaceInvite } from '../../core/models/workspace-invite';
import { WORKSPACE_ROLE_LABELS } from '../../core/models/workspace-role';
import { formatRelative } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';

export interface PendingInviteRow {
  readonly invite: WorkspaceInvite;
  readonly meta: string;
  readonly resendLabel: string;
  readonly revokeLabel: string;
}

export interface PendingInvitesEmptyView {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
}

export type InviterNameOf = (userId: string) => string | null;

const META_SEPARATOR = ' · ';
const SELF_INVITER = 'you';
const UNKNOWN_INVITER = 'an admin';
const QUEUED_NOTE = 'queued';

export const inviterLabelOf = (
  invitedById: string,
  viewerId: string | null,
  nameOf: InviterNameOf,
): string => (invitedById === viewerId ? SELF_INVITER : (nameOf(invitedById) ?? UNKNOWN_INVITER));

export const pendingInviteRowOf = (
  invite: WorkspaceInvite,
  inviter: string,
  now = Date.now(),
): PendingInviteRow => ({
  invite,
  meta: [
    WORKSPACE_ROLE_LABELS[invite.role],
    `invited by ${inviter}`,
    formatRelative(invite.invitedAt, now),
    ...(invite.queued ? [QUEUED_NOTE] : []),
  ].join(META_SEPARATOR),
  resendLabel: `Resend invitation to ${invite.email}`,
  revokeLabel: `Revoke invitation to ${invite.email}`,
});

export const invitesMatching = (
  invites: readonly WorkspaceInvite[],
  query: string,
): readonly WorkspaceInvite[] => {
  const normalized = query.trim().toLowerCase();
  return normalized
    ? invites.filter((invite) => invite.email.toLowerCase().includes(normalized))
    : invites;
};

export const pendingInvitesEmptyOf = (query: string): PendingInvitesEmptyView => {
  const trimmed = query.trim();
  return trimmed
    ? {
        icon: 'search',
        heading: 'No invitations match',
        message: `No pending invitation matches “${trimmed}”. Try another email address.`,
      }
    : {
        icon: 'mail',
        heading: 'No pending invitations',
        message: 'Everyone you’ve invited has joined.',
      };
};
