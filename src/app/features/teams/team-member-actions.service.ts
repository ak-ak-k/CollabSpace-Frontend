import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';
import { TeamMembershipState } from '../../core/state/team-membership.state';
import { PersonActions } from '../../shared/components/person-panel/person-actions.service';
import { PersonPanelService } from '../../shared/components/person-panel/person-panel.service';
import { TeamAdminActions } from './team-admin-actions.service';
import {
  TeamMemberActionKind,
  TeamMemberMenuItem,
  teamMemberMenuItems,
  TeamMemberView,
} from './team-member-view';
import {
  TeamMemberSheetComponent,
  TeamMemberSheetData,
} from './team-member-sheet/team-member-sheet.component';

@Service()
export class TeamMemberActions {
  private readonly membership = inject(TeamMembershipState);
  private readonly admin = inject(TeamAdminActions);
  private readonly people = inject(PersonActions);
  private readonly personPanel = inject(PersonPanelService);
  private readonly dialogs = inject(DialogService);

  menuItems(teamId: string, member: TeamMemberView): readonly TeamMemberMenuItem[] {
    return teamMemberMenuItems(member, this.membership.canManageTeam(teamId));
  }

  run(kind: TeamMemberActionKind, teamId: string, member: TeamMemberView): void {
    switch (kind) {
      case 'profile':
        this.personPanel.open(member.id);
        break;
      case 'message':
        void this.people.message(member.id);
        break;
      case 'role':
        void this.admin.setRole(teamId, member.id, member.role === 'admin' ? 'member' : 'admin');
        break;
      case 'remove':
        void this.admin.removeMember(teamId, member.id);
        break;
    }
  }

  openSheet(teamId: string, member: TeamMemberView): DialogRef<TeamMemberActionKind> {
    const sheet = this.dialogs.openDrawer<TeamMemberActionKind, TeamMemberSheetData>(
      TeamMemberSheetComponent,
      {
        data: { member, items: this.menuItems(teamId, member) },
        side: 'bottom',
        ariaLabel: `Actions for ${member.name}`,
      },
    );
    sheet.closed.subscribe((kind) => kind && this.run(kind, teamId, member));
    return sheet;
  }
}
