import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatState } from '../../../core/state/chat.state';
import { TeamChannelsState } from '../../../core/state/team-channels.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { SecondarySidebarComponent } from '../../../layout/secondary-sidebar/secondary-sidebar.component';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

interface SidebarChannel {
  readonly id: string;
  readonly name: string;
  readonly icon: IconName;
  readonly unreadCount: number;
  readonly current: boolean;
}

interface SidebarTeam {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly open: boolean;
  readonly channels: readonly SidebarChannel[];
}

const SIDEBAR_DIRECT_MESSAGE_LIMIT = 6;

@Component({
  selector: 'app-teams-sidebar',
  imports: [RouterLink, SecondarySidebarComponent, AvatarComponent, BadgeComponent, IconComponent],
  templateUrl: './teams-sidebar.component.html',
  styleUrl: './teams-sidebar.component.scss',
})
export class TeamsSidebarComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly teamChannels = inject(TeamChannelsState);

  readonly teamId = input<string | null>(null);
  readonly channelId = input<string | null>(null);

  protected readonly teams = computed<readonly SidebarTeam[]>(() =>
    this.workspace.joinedTeams().map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code,
      open: team.id === this.teamId(),
      channels: this.teamChannels.visibleChannels(team).map((channel) => ({
        id: channel.id,
        name: channel.name,
        icon: channel.isPrivate ? 'lock' : 'hash',
        unreadCount: this.teamChannels.access().unreadOf(channel.id),
        current: channel.id === this.channelId(),
      })),
    })),
  );
  protected readonly directMessages = computed(() =>
    this.chat
      .previews()
      .filter((preview) => preview.type === 'dm')
      .slice(0, SIDEBAR_DIRECT_MESSAGE_LIMIT),
  );
}
