import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../../core/models/team';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { WorkspaceActions } from '../workspace/workspace-actions.service';
import {
  CreateTeamDialogComponent,
  TeamDialogData,
} from './create-team-dialog/create-team-dialog.component';
import { TeamAdminActions } from './team-admin-actions.service';

@Service()
export class TeamActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly workspaceActions = inject(WorkspaceActions);
  private readonly admin = inject(TeamAdminActions);
  private readonly chat = inject(ChatState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  createTeam(): void {
    this.workspaceActions.openCreateTeam();
  }

  addMembers(teamId: string): void {
    void this.admin.addMembers(teamId);
  }

  inviteByEmail(teamId: string): void {
    this.workspaceActions.openInvite(teamId);
  }

  openSettings(teamId: string): void {
    const data: TeamDialogData = { teamId };
    this.dialogs.open(CreateTeamDialogComponent, { size: 'md', data });
  }

  createChannel(teamId: string | null = null): void {
    this.workspaceActions.openCreateChannel(teamId);
  }

  manage(teamId: string): void {
    void this.router.navigate(['/teams', teamId, 'members']);
  }

  async join(team: Team): Promise<void> {
    await this.workspace.toggleMembership(team.id);
    this.toasts.show(`Joined ${team.name}`, { icon: 'users' });
  }

  async leave(team: Team): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: `Leave ${team.name}?`,
      body: 'You’ll lose access to its private channels. You can rejoin public teams any time.',
      confirmLabel: 'Leave team',
      icon: 'log-out',
    });
    if (confirmed) {
      await this.workspace.toggleMembership(team.id);
      this.toasts.show(`Left ${team.name}`, { icon: 'users' });
    }
  }

  async message(userId: string): Promise<void> {
    const conversationId = await this.chat.openDirectConversation(userId);
    await this.router.navigate(['/messages', conversationId]);
  }

  download(name: string): void {
    this.toasts.show(`Downloading ${name}`, { icon: 'download' });
  }
}
