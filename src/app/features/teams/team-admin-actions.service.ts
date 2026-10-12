import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { AssignableTeamRole } from '../../core/models/team';
import { firstNameOf } from '../../core/models/user';
import { ConnectionGuard } from '../../core/services/connection-guard.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { TeamMembershipState } from '../../core/state/team-membership.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { AddPeopleDialog } from '../messages/add-people-dialog/add-people-dialog.service';

const TEAMS_ROUTE = '/teams';
const UNKNOWN_PERSON = 'Someone';

@Service()
export class TeamAdminActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly membership = inject(TeamMembershipState);
  private readonly addPeopleDialog = inject(AddPeopleDialog);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly connection = inject(ConnectionGuard);

  async addMembers(teamId: string): Promise<void> {
    const team = this.workspace.team(teamId);
    if (!team || !this.connection.allows('addPeople')) {
      return;
    }
    const userIds = await this.addPeopleDialog.open({
      title: `Add people to ${team.name}`,
      description: 'They’ll join the team and its public channels. You can skip this for now.',
      excludeIds: team.memberIds,
      confirmLabel: 'Add to team',
    });
    if (userIds.length === 0) {
      return;
    }
    const saving = this.membership.addToTeam(teamId, userIds);
    this.toasts.show(`${this.peopleLabel(userIds)} added to ${team.name}`, { icon: 'user-plus' });
    await saving;
  }

  async setRole(teamId: string, userId: string, role: AssignableTeamRole): Promise<void> {
    if (!this.connection.allows('setTeamRole')) {
      return;
    }
    const saving = this.membership.setTeamRole(teamId, userId, role);
    const status = role === 'admin' ? 'is now a team admin' : 'is now a team member';
    this.toasts.show(`${this.firstNameOf(userId)} ${status}`, { icon: 'shield-check' });
    await saving;
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = this.workspace.team(teamId);
    const name = this.workspace.user(userId)?.name ?? UNKNOWN_PERSON;
    if (!team || !this.connection.allows('removeFromTeam')) {
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: `Remove ${name} from ${team.name}?`,
      body: 'They’ll lose access to the team’s private channels but stay in the workspace.',
      confirmLabel: 'Remove from team',
      icon: 'user-minus',
      canConfirm: this.connection.recheck('removeFromTeam'),
    });
    if (!confirmed) {
      return;
    }
    const wasAdmin = this.membership.roleOf(teamId, userId) === 'admin';
    const saving = this.membership.removeFromTeam(teamId, userId);
    this.toasts.show(`${name} removed from ${team.name}`, {
      icon: 'user-minus',
      actionLabel: 'Undo',
      onAction: () => void this.restoreMember(teamId, userId, wasAdmin),
    });
    await saving;
  }

  async archive(teamId: string): Promise<boolean> {
    const team = this.workspace.team(teamId);
    const confirmed =
      !!team &&
      this.connection.allows('archiveTeam') &&
      (await this.dialogs.confirm({
        title: `Archive ${team.name}?`,
        body: 'The team and its channels become read-only and leave every list. You can restore it from the undo message.',
        confirmLabel: 'Archive team',
        icon: 'archive',
        tone: 'neutral',
        canConfirm: this.connection.recheck('archiveTeam'),
      }));
    if (!team || !confirmed) {
      return false;
    }
    await this.router.navigateByUrl(TEAMS_ROUTE);
    const saving = this.membership.setArchived(teamId, true);
    this.toasts.show(`${team.name} archived`, {
      icon: 'archive',
      actionLabel: 'Undo',
      onAction: () => void this.membership.setArchived(teamId, false),
    });
    await saving;
    return true;
  }

  private async restoreMember(teamId: string, userId: string, wasAdmin: boolean): Promise<void> {
    const adding = this.membership.addToTeam(teamId, [userId]);
    const promoting = wasAdmin
      ? this.membership.setTeamRole(teamId, userId, 'admin')
      : Promise.resolve();
    await Promise.all([adding, promoting]);
  }

  private peopleLabel(userIds: readonly string[]): string {
    return userIds.length > 1 ? `${userIds.length} people` : this.firstNameOf(userIds[0]);
  }

  private firstNameOf(userId: string): string {
    return firstNameOf(this.workspace.user(userId)?.name ?? UNKNOWN_PERSON);
  }
}
