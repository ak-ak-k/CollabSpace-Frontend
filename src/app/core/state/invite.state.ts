import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { InvitesData } from '../data/invites.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { MemberActivityAction } from '../models/activity-action';
import { WorkspaceRole } from '../models/user';
import { WorkspaceInvite } from '../models/workspace-invite';
import { ActivityLogState } from './activity-log.state';
import { pendingOfKind, unsettledOfKind } from './activity-outcome';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

export interface InviteRequest {
  readonly emails: readonly string[];
  readonly role: WorkspaceRole;
  readonly teamId: string | null;
  readonly queued: boolean;
}

export interface InviteOutcome {
  readonly added: readonly WorkspaceInvite[];
  readonly resent: readonly WorkspaceInvite[];
}

type InviteAuditVerb =
  'resent the invitation to' | 'revoked the invitation to' | 'restored the invitation to';

const INVITE_ACTIONS: Record<InviteAuditVerb, MemberActivityAction> = {
  'resent the invitation to': 'invite.resent',
  'revoked the invitation to': 'invite.revoked',
  'restored the invitation to': 'invite.restored',
};

const INVITED_ROUTE = '/workspace/members/invited';

const sameEmail = (first: string, second: string): boolean =>
  first.toLowerCase() === second.toLowerCase();

@Service()
export class InviteState {
  private readonly data = inject(InvitesData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);
  private readonly activity = inject(ActivityLogState);

  private readonly allInvites = signal<readonly WorkspaceInvite[]>([]);
  private createdInvites = 0;

  private readonly loader = new Loadable<readonly WorkspaceInvite[]>({
    fetch: () => this.data.getInvites(),
    store: (invites) => this.allInvites.set(invites),
    isEmpty: (invites) => invites.length === 0,
  });

  readonly invites = computed(() =>
    this.allInvites()
      .filter((invite) => this.workspace.contains(invite))
      .sort((first, second) => second.invitedAt - first.invitedAt),
  );
  readonly status = settledStatus(this.loader.status, () => this.invites().length === 0);
  readonly pendingCount = computed(() => this.invites().length);
  readonly queuedCount = computed(() => this.allInvites().filter((invite) => invite.queued).length);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  pendingFor(email: string): WorkspaceInvite | null {
    return this.invites().find((invite) => sameEmail(invite.email, email)) ?? null;
  }

  async invite(request: InviteRequest): Promise<InviteOutcome> {
    const now = Date.now();
    const resent = request.emails
      .map((email) => this.pendingFor(email))
      .filter((invite): invite is WorkspaceInvite => invite !== null)
      .map((invite) => ({
        ...invite,
        role: request.role,
        invitedAt: now,
        invitedById: CURRENT_USER_ID,
      }));
    const added = request.emails
      .filter((email) => !this.pendingFor(email))
      .map((email) => this.newInvite(email, request, now));
    await this.save([...added, ...resent]);
    return { added, resent };
  }

  async resend(inviteId: string): Promise<WorkspaceInvite | null> {
    const invite = this.find(inviteId);
    if (!invite) {
      return null;
    }
    const resent = { ...invite, invitedAt: Date.now(), invitedById: CURRENT_USER_ID };
    this.log('resent the invitation to', invite);
    await this.save([resent]);
    return resent;
  }

  async revoke(inviteId: string): Promise<WorkspaceInvite | null> {
    const invite = this.find(inviteId);
    if (!invite) {
      return null;
    }
    this.allInvites.update((invites) => invites.filter((candidate) => candidate.id !== inviteId));
    this.log('revoked the invitation to', invite);
    await this.data.revokeInvite(inviteId);
    return invite;
  }

  restore(invite: WorkspaceInvite): Promise<void> {
    this.log('restored the invitation to', invite);
    return this.save([invite]);
  }

  async flushQueued(): Promise<number> {
    const queued = this.allInvites().filter((invite) => invite.queued);
    this.activity.setOutcome(unsettledOfKind('invite'), 'succeeded');
    if (queued.length > 0) {
      await this.save(queued.map((invite) => ({ ...invite, queued: false })));
    }
    return queued.length;
  }

  failQueued(): number {
    return this.activity.setOutcome(pendingOfKind('invite'), 'failed');
  }

  private log(verb: InviteAuditVerb, invite: WorkspaceInvite): void {
    this.activity.record(
      {
        kind: 'invite',
        verb,
        object: invite.email,
        route: INVITED_ROUTE,
        action: INVITE_ACTIONS[verb],
        meta: { role: invite.role },
      },
      invite.workspaceId,
    );
  }

  private find(inviteId: string): WorkspaceInvite | null {
    return this.allInvites().find((invite) => invite.id === inviteId) ?? null;
  }

  private newInvite(email: string, request: InviteRequest, now: number): WorkspaceInvite {
    return {
      id: `i-new-${now.toString(36)}-${++this.createdInvites}`,
      workspaceId: this.workspace.currentWorkspaceId(),
      email,
      role: request.role,
      invitedById: CURRENT_USER_ID,
      invitedAt: now,
      teamId: request.teamId,
      queued: request.queued,
    };
  }

  private async save(changed: readonly WorkspaceInvite[]): Promise<void> {
    const changedIds = new Set(changed.map((invite) => invite.id));
    this.allInvites.update((invites) => [
      ...changed,
      ...invites.filter((invite) => !changedIds.has(invite.id)),
    ]);
    await this.data.saveInvites(changed);
  }
}
