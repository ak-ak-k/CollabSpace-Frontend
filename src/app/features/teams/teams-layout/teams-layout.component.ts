import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { RouteAccessState } from '../../../core/state/route-access.state';
import { RouteBlockComponent } from '../../system/route-block/route-block.component';
import { TeamsSidebarComponent } from '../teams-sidebar/teams-sidebar.component';

@Component({
  selector: 'app-teams-layout',
  imports: [RouterOutlet, RouteBlockComponent, TeamsSidebarComponent],
  templateUrl: './teams-layout.component.html',
  styleUrl: './teams-layout.component.scss',
})
export class TeamsLayoutComponent {
  private readonly access = inject(RouteAccessState);
  private readonly breakpoint = inject(BreakpointService);

  private readonly target = computed(() => {
    const target = this.access.target();
    return target.kind === 'team' ? target : null;
  });
  protected readonly block = this.access.teamBlock;
  protected readonly teamId = computed(() => this.target()?.teamId ?? null);
  protected readonly channelId = computed(() => this.target()?.channelId ?? null);
  protected readonly showSidebar = computed(
    () => this.breakpoint.isDesktop() && this.teamId() !== null,
  );
}
