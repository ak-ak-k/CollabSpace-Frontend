import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { firstNameOf } from '../../../core/models/user';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TeamStat } from '../team-detail/team-detail-data';
import { TeamMemberView } from '../team-member-view';
import { ChannelRowView, TeamActivityItem } from '../team-view';

const OVERVIEW_ACTIVITY_LIMIT = 4;

@Component({
  selector: 'app-team-overview',
  imports: [
    RouterLink,
    SectionHeaderComponent,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    IconComponent,
  ],
  templateUrl: './team-overview.component.html',
  styleUrl: './team-overview.component.scss',
})
export class TeamOverviewComponent {
  private readonly router = inject(Router);

  readonly teamId = input.required<string>();
  readonly channels = input.required<readonly ChannelRowView[]>();
  readonly activity = input.required<readonly TeamActivityItem[]>();
  readonly stats = input.required<readonly TeamStat[]>();
  readonly lead = input<TeamMemberView | null>(null);

  readonly message = output<string>();

  protected readonly recentActivity = computed(() =>
    this.activity().slice(0, OVERVIEW_ACTIVITY_LIMIT),
  );
  protected readonly channelsLink = computed(() => `/teams/${this.teamId()}/channels`);
  protected readonly activityLink = computed(() => `/teams/${this.teamId()}/activity`);
  protected readonly leadFirstName = computed(() => firstNameOf(this.lead()?.name ?? ''));

  protected linkTo(route: string): UrlTree | null {
    return route ? this.router.parseUrl(route) : null;
  }
}
