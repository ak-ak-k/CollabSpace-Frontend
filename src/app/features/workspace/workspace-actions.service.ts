import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { NewWorkspace } from '../../core/models/workspace';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkspaceActivityState } from '../../core/state/workspace-activity.state';
import { WorkspaceAdminState } from '../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import {
  CREATE_TEAM_FIRST,
  CreateChannelDialogComponent,
  CreateChannelDialogData,
  CreateChannelDialogResult,
} from '../teams/create-channel-dialog/create-channel-dialog.component';
import { CreateTeamDialogComponent } from '../teams/create-team-dialog/create-team-dialog.component';
import {
  InviteDialogComponent,
  InviteDialogData,
} from '../teams/invite-dialog/invite-dialog.component';
import { CreateWorkspaceDialogComponent } from './create-workspace-dialog/create-workspace-dialog.component';

export const WORKSPACE_ROUTE = '/workspace';
const LOCKED_ICON = 'lock';

@Service()
export class WorkspaceActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  openInvite(teamId: string | null = null): void {
    if (!this.workspace.access().canInvite) {
      this.toasts.show(`Only owners and admins can invite people to ${this.workspaceName()}`, {
        icon: LOCKED_ICON,
      });
      return;
    }
    const data: InviteDialogData = { teamId: teamId ?? undefined };
    this.dialogs.open(InviteDialogComponent, { size: 'md', data });
  }

  openCreateTeam(): void {
    if (this.blockGuest('teams')) {
      return;
    }
    this.dialogs.open(CreateTeamDialogComponent, { size: 'md' });
  }

  openCreateChannel(teamId: string | null = null): void {
    if (this.blockGuest('channels')) {
      return;
    }
    const data: CreateChannelDialogData = { teamId };
    this.dialogs
      .open<CreateChannelDialogResult>(CreateChannelDialogComponent, { size: 'md', data })
      .closed.subscribe((result) => {
        if (result === CREATE_TEAM_FIRST) {
          this.openCreateTeam();
        }
      });
  }

  openCreateWorkspace(): void {
    this.dialogs.open(CreateWorkspaceDialogComponent, { size: 'md' });
  }

  async createWorkspace(draft: NewWorkspace): Promise<void> {
    const created = await this.admin.createWorkspace(draft);
    this.activity.record(
      { kind: 'workspace', verb: 'created', object: created.name, route: WORKSPACE_ROUTE },
      created.id,
    );
    await this.router.navigateByUrl(WORKSPACE_ROUTE);
    this.toasts.show(`${created.name} is ready — invite your team to get started`, {
      icon: 'building-2',
      actionLabel: 'Invite',
      onAction: () => this.openInvite(),
    });
  }

  private blockGuest(things: 'teams' | 'channels'): boolean {
    if (this.workspace.access().canCreateTeams) {
      return false;
    }
    this.toasts.show(`Guests can’t create ${things} in ${this.workspaceName()}`, {
      icon: LOCKED_ICON,
    });
    return true;
  }

  private workspaceName(): string {
    return this.workspace.currentWorkspace()?.name ?? 'this workspace';
  }
}
