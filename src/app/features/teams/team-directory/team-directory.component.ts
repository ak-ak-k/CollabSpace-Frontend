import { Component, computed, inject, signal } from '@angular/core';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { TeamActions } from '../team-actions.service';
import { TeamCardComponent } from '../team-card/team-card.component';
import { TeamTableComponent } from '../team-table/team-table.component';
import { matchesTeamQuery, teamCardView } from '../team-view';

type TeamFilter = 'all' | 'mine';

const LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'grid', label: 'Grid view', icon: 'layout-grid' },
  { value: 'list', label: 'List view', icon: 'list' },
];

@Component({
  selector: 'app-team-directory',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    RadioGroupComponent,
    SearchInputComponent,
    SkeletonComponent,
    TabsComponent,
    TeamCardComponent,
    TeamTableComponent,
  ],
  templateUrl: './team-directory.component.html',
  styleUrl: './team-directory.component.scss',
})
export class TeamDirectoryComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly breakpoint = inject(BreakpointService);
  protected readonly actions = inject(TeamActions);

  protected readonly query = signal('');
  protected readonly filter = signal<TeamFilter>('all');
  protected readonly layout = signal('grid');
  protected readonly layoutOptions = LAYOUT_OPTIONS;

  protected readonly status = this.workspace.status;
  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly showsTable = computed(() => this.layout() === 'list' && !this.isMobile());
  protected readonly subtitle = computed(() => {
    const workspaceName = this.workspace.currentWorkspace()?.name ?? 'your workspace';
    const total = this.workspace.teams().length;
    return `${total} teams in ${workspaceName} · you’re in ${this.workspace.joinedTeams().length}`;
  });
  protected readonly tabs = computed<readonly TabItem[]>(() => [
    { id: 'all', label: `All teams · ${this.workspace.teams().length}` },
    { id: 'mine', label: `Your teams · ${this.workspace.joinedTeams().length}` },
  ]);
  protected readonly teams = computed(() => {
    const query = this.query().trim().toLowerCase();
    const currentUserId = this.workspace.currentUser()?.id ?? '';
    return this.workspace
      .teams()
      .filter((team) => (this.filter() === 'all' || team.joined) && matchesTeamQuery(team, query))
      .map((team) => teamCardView(team, this.workspace.usersById(), currentUserId));
  });
  protected readonly noMatch = computed(() => {
    const query = this.query().trim();
    if (query) {
      return { heading: 'No teams found', message: `No teams match “${query}”.` };
    }
    return {
      heading: 'No teams joined yet',
      message: 'Join a team from All teams to see it here.',
    };
  });

  protected selectFilter(filter: string): void {
    this.filter.set(filter === 'mine' ? 'mine' : 'all');
  }

  protected join(teamId: string): void {
    const team = this.workspace.team(teamId);
    if (team) {
      void this.actions.join(team);
    }
  }

  protected reload(): void {
    void this.workspace.reload();
  }
}
