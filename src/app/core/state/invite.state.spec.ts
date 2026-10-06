import { TestBed } from '@angular/core/testing';
import { InviteState } from './invite.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceActivityState } from './workspace-activity.state';
import { WorkspaceState } from './workspace.state';

describe('InviteState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  it('lists pending invitations for the current workspace, newest first', async () => {
    const invites = TestBed.inject(InviteState);
    await settle();

    expect(invites.invites().map((invite) => invite.email)).toEqual([
      'rohan.verma@northstar.io',
      'neha.kapoor@northstar.io',
      'jordan@lumenpartners.com',
    ]);

    TestBed.inject(WorkspaceState).switchWorkspace('w3');

    expect(invites.pendingCount()).toBe(0);
    expect(invites.status()).toBe('empty');
  });

  it('sends new invitations and resends existing ones', async () => {
    const invites = TestBed.inject(InviteState);
    await settle();

    const outcome = await invites.invite({
      emails: ['new.person@northstar.io', 'Rohan.Verma@northstar.io'],
      role: 'member',
      teamId: null,
      queued: true,
    });

    expect(outcome.added.map((invite) => invite.email)).toEqual(['new.person@northstar.io']);
    expect(outcome.resent.map((invite) => invite.email)).toEqual(['rohan.verma@northstar.io']);
    expect(invites.pendingCount()).toBe(4);
    expect(await invites.flushQueued()).toBe(1);
  });

  it('revokes an invitation, restores it on undo and logs both in the audit log', async () => {
    const invites = TestBed.inject(InviteState);
    const activity = TestBed.inject(WorkspaceActivityState);
    await settle();

    const revoked = await invites.revoke('i1');

    expect(invites.pendingCount()).toBe(2);

    await invites.restore(revoked!);

    expect(invites.pendingFor('rohan.verma@northstar.io')?.id).toBe('i1');
    expect(
      activity
        .events({ category: 'audit' })
        .slice(0, 2)
        .map((event) => `${event.verb} ${event.object}`),
    ).toEqual([
      'restored the invitation to rohan.verma@northstar.io',
      'revoked the invitation to rohan.verma@northstar.io',
    ]);
  });
});
