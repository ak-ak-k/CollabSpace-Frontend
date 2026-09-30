import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../../core/models/team';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { CreateTeamDialogComponent } from './create-team-dialog/create-team-dialog.component';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';

@Service()
export class TeamActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  createTeam(): void {
    this.dialogs.open(CreateTeamDialogComponent, { size: 'md' });
  }

  invite(teamId: string): void {
    this.dialogs.open(InviteDialogComponent, { size: 'md', data: { teamId } });
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

  createChannel(): void {
    this.toasts.show('Channel creation is coming soon to this prototype', { icon: 'info' });
  }

  download(name: string): void {
    this.toasts.show(`Downloading ${name}`, { icon: 'download' });
  }
}
