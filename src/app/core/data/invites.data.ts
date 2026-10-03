import { inject, Service } from '@angular/core';
import { MOCK_WORKSPACE_INVITES } from '../mocks/workspace-invites.mock';
import { WorkspaceInvite } from '../models/workspace-invite';
import { MockRequest } from './mock-request';

@Service()
export class InvitesData {
  private readonly request = inject(MockRequest);

  private invites = [...MOCK_WORKSPACE_INVITES];

  getInvites(): Promise<readonly WorkspaceInvite[]> {
    return this.request.read(() => this.invites, []);
  }

  saveInvites(saved: readonly WorkspaceInvite[]): Promise<readonly WorkspaceInvite[]> {
    return this.request.write(() => {
      const savedIds = new Set(saved.map((invite) => invite.id));
      this.invites = [...saved, ...this.invites.filter((invite) => !savedIds.has(invite.id))];
      return saved;
    });
  }

  revokeInvite(inviteId: string): Promise<void> {
    return this.request.write(() => {
      this.invites = this.invites.filter((invite) => invite.id !== inviteId);
    });
  }
}
