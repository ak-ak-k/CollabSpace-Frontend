import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { CurrentRoute } from '../../../layout/current-route';
import { TeamsSidebarComponent } from '../teams-sidebar/teams-sidebar.component';

const TEAM_PATH = /^\/teams\/([^/?#]+)(?:\/c\/([^/?#]+))?/;

@Component({
  selector: 'app-teams-layout',
  imports: [RouterOutlet, TeamsSidebarComponent],
  templateUrl: './teams-layout.component.html',
  styleUrl: './teams-layout.component.scss',
})
export class TeamsLayoutComponent {
  private readonly route = inject(CurrentRoute);
  private readonly breakpoint = inject(BreakpointService);

  private readonly match = computed(() => TEAM_PATH.exec(this.route.path()));
  protected readonly teamId = computed(() => this.match()?.[1] ?? null);
  protected readonly channelId = computed(() => this.match()?.[2] ?? null);
  protected readonly showSidebar = computed(
    () => this.breakpoint.isDesktop() && this.teamId() !== null,
  );
}
