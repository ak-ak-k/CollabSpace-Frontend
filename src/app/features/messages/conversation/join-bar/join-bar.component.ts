import { Component, inject, input } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { TeamActions } from '../../../teams/team-actions.service';
import { MembershipActions } from '../../membership-actions.service';
import { JoinBarView } from '../conversation-access';

@Component({
  selector: 'app-join-bar',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './join-bar.component.html',
  styleUrl: './join-bar.component.scss',
  host: { role: 'status' },
})
export class JoinBarComponent {
  private readonly membership = inject(MembershipActions);
  private readonly teams = inject(TeamActions);

  readonly bar = input.required<JoinBarView>();

  protected run(): void {
    const bar = this.bar();
    if (bar.action === 'unarchive') {
      this.membership.unarchiveChannel(bar.conversationId);
    } else if (bar.action === 'rejoin') {
      this.membership.rejoinChannel(bar.conversationId);
    } else if (bar.action === 'join-team' && bar.team) {
      void this.teams.join(bar.team);
    }
  }
}
