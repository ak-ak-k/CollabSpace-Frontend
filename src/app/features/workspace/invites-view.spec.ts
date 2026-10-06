import { WorkspaceInvite } from '../../core/models/workspace-invite';
import {
  inviterLabelOf,
  invitesMatching,
  pendingInviteRowOf,
  pendingInvitesEmptyOf,
} from './invites-view';

const NOW = new Date(2026, 9, 6, 15, 0).getTime();
const HOUR = 3_600_000;

const invite = (id: string, changes: Partial<WorkspaceInvite> = {}): WorkspaceInvite => ({
  id,
  workspaceId: 'w1',
  email: 'rohan.verma@northstar.io',
  role: 'member',
  invitedById: 'u4',
  invitedAt: NOW - 3 * HOUR,
  teamId: null,
  queued: false,
  ...changes,
});

const nameOf = (userId: string): string | null => (userId === 'u4' ? 'Kavya Reddy' : null);

describe('invites view', () => {
  it('names the inviter as you, a member or an admin', () => {
    expect(inviterLabelOf('u0', 'u0', nameOf)).toBe('you');
    expect(inviterLabelOf('u4', 'u0', nameOf)).toBe('Kavya Reddy');
    expect(inviterLabelOf('u99', 'u0', nameOf)).toBe('an admin');
  });

  it('builds the row meta and accessible button names', () => {
    expect(pendingInviteRowOf(invite('i1'), 'Kavya Reddy', NOW)).toMatchObject({
      meta: 'Member · invited by Kavya Reddy · 3h ago',
      resendLabel: 'Resend invitation to rohan.verma@northstar.io',
      revokeLabel: 'Revoke invitation to rohan.verma@northstar.io',
    });
    expect(pendingInviteRowOf(invite('i2', { role: 'guest', queued: true }), 'you', NOW).meta).toBe(
      'Guest · invited by you · 3h ago · queued',
    );
  });

  it('filters invitations by email and explains an empty list', () => {
    const invites = [invite('i1'), invite('i2', { email: 'jordan@lumenpartners.com' })];

    expect(invitesMatching(invites, ' LUMEN ').map((item) => item.id)).toEqual(['i2']);
    expect(invitesMatching(invites, '')).toHaveLength(2);
    expect(pendingInvitesEmptyOf('').heading).toBe('No pending invitations');
    expect(pendingInvitesEmptyOf('zed').heading).toBe('No invitations match');
  });
});
