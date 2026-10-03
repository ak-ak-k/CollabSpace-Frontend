import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { OverviewTeamRow } from '../workspace-overview/overview-view';

@Component({
  selector: 'app-overview-teams',
  imports: [AvatarComponent, ButtonComponent, IconComponent, RouterLink, SectionHeaderComponent],
  templateUrl: './overview-teams.component.html',
  styleUrl: './overview-teams.component.scss',
})
export class OverviewTeamsComponent {
  readonly teams = input.required<readonly OverviewTeamRow[]>();
  readonly canCreate = input(false, { transform: booleanAttribute });
  readonly createTeam = output<void>();

  protected readonly heading = computed(() => `Teams · ${this.teams().length}`);
}
