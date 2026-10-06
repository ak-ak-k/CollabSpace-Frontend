import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { FileState } from '../../../core/state/file.state';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../shared/ui/breadcrumb/breadcrumb.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { TeamActions } from '../team-actions.service';
import { TeamActivityComponent } from '../team-activity/team-activity.component';
import { TeamChannelsComponent } from '../team-channels/team-channels.component';
import { TeamFilesComponent } from '../team-files/team-files.component';
import { TeamHeaderComponent } from '../team-header/team-header.component';
import { TeamMembersComponent } from '../team-members/team-members.component';
import { TeamOverviewComponent } from '../team-overview/team-overview.component';
import { TeamTasksComponent } from '../team-tasks/team-tasks.component';
import { injectTeamDetail } from './team-detail-data';

type TeamTab = 'overview' | 'members' | 'channels' | 'tasks' | 'files' | 'activity';

const TEAM_TABS: readonly TeamTab[] = [
  'overview',
  'members',
  'channels',
  'tasks',
  'files',
  'activity',
];

const TAB_LABELS: Record<TeamTab, string> = {
  overview: 'Overview',
  members: 'Members',
  channels: 'Channels',
  tasks: 'Tasks',
  files: 'Files',
  activity: 'Activity',
};

const tabOf = (value: string | undefined): TeamTab | null =>
  TEAM_TABS.find((tab) => tab === (value ?? 'overview')) ?? null;

@Component({
  selector: 'app-team-detail',
  imports: [
    BreadcrumbComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TabsComponent,
    TeamHeaderComponent,
    TeamOverviewComponent,
    TeamMembersComponent,
    TeamChannelsComponent,
    TeamTasksComponent,
    TeamFilesComponent,
    TeamActivityComponent,
  ],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.scss',
})
export class TeamDetailComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly router = inject(Router);
  protected readonly fileState = inject(FileState);
  protected readonly taskState = inject(TaskState);
  protected readonly actions = inject(TeamActions);
  protected readonly breakpoint = inject(BreakpointService);

  readonly teamId = input.required<string>();
  readonly tab = input<string | undefined>(undefined);

  protected readonly detail = injectTeamDetail(() => this.teamId());
  protected readonly status = this.workspace.status;
  protected readonly canInvite = computed(() => this.workspace.access().canInvite);
  protected readonly canCreateChannels = computed(() => this.workspace.access().canCreateChannels);
  protected readonly activeTab = computed(() => tabOf(this.tab()) ?? 'overview');
  protected readonly breadcrumb = computed<readonly BreadcrumbItem[]>(() => [
    { label: this.workspace.currentWorkspace()?.name ?? 'Workspace', link: '/workspace' },
    { label: 'Teams', link: '/teams' },
    { label: this.detail.team()?.name ?? '' },
  ]);
  protected readonly tabs = computed<readonly TabItem[]>(() => {
    const counts: Partial<Record<TeamTab, number>> = {
      members: this.detail.team()?.memberIds.length,
      channels: this.detail.channels().length,
      tasks: this.detail.tasks().length,
      files: this.detail.files().length,
    };
    return TEAM_TABS.map((tab) => ({
      id: tab,
      label: TAB_LABELS[tab],
      count: counts[tab] ?? 0,
      link: ['/teams', this.teamId(), tab],
    }));
  });

  constructor() {
    effect(() => {
      const tab = this.tab();
      if (tab !== undefined && tabOf(tab) === null) {
        untracked(() => void this.router.navigate(['/teams', this.teamId()], { replaceUrl: true }));
      }
    });
  }

  protected reload(): void {
    void this.workspace.reload();
  }

  protected backToTeams(): void {
    void this.router.navigate(['/teams']);
  }
}
