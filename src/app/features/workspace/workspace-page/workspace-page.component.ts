import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WORKSPACE_ROLE_LABELS, roleWithArticle } from '../../../core/models/workspace-role';
import { workspaceUrlOf } from '../../../core/models/workspace-rules';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { RouteAccessState } from '../../../core/state/route-access.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { CurrentRoute } from '../../../layout/current-route';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { RouteBlockComponent } from '../../system/route-block/route-block.component';
import { WORKSPACE_ROUTE } from '../workspace-actions.service';

type WorkspaceTab = 'overview' | 'members' | 'settings';

const MEMBERS_ROUTE = `${WORKSPACE_ROUTE}/members`;
const SETTINGS_ROUTE = `${WORKSPACE_ROUTE}/settings`;
const GENERAL_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/general`;

const ROLE_ICONS = {
  owner: 'crown',
  admin: 'shield-check',
  member: 'user',
  guest: 'user',
} as const;

const SECTION_TABS: readonly (readonly [route: string, tab: WorkspaceTab])[] = [
  [MEMBERS_ROUTE, 'members'],
  [SETTINGS_ROUTE, 'settings'],
];

const tabOf = (path: string): WorkspaceTab =>
  SECTION_TABS.find(([route]) => path.startsWith(route))?.[1] ?? 'overview';

@Component({
  selector: 'app-workspace-page',
  imports: [RouterOutlet, IconComponent, RouteBlockComponent, TabsComponent, TagComponent],
  templateUrl: './workspace-page.component.html',
  styleUrl: './workspace-page.component.scss',
})
export class WorkspacePageComponent {
  private readonly state = inject(WorkspaceState);
  private readonly route = inject(CurrentRoute);
  private readonly breakpoint = inject(BreakpointService);

  protected readonly block = inject(RouteAccessState).settingsBlock;
  protected readonly workspace = this.state.currentWorkspace;
  protected readonly myRole = computed(() => this.state.access().myRole);
  protected readonly roleIcon = computed<IconName>(() => ROLE_ICONS[this.myRole()]);
  protected readonly roleTag = computed(() => `You’re ${roleWithArticle(this.myRole())}`);
  protected readonly roleLabel = computed(() => WORKSPACE_ROLE_LABELS[this.myRole()]);
  protected readonly url = computed(() => workspaceUrlOf(this.workspace()?.slug ?? ''));
  protected readonly activeTab = computed(() => tabOf(this.route.path()));
  protected readonly tabs = computed<readonly TabItem[]>(() => {
    const ready = this.state.loadStatus() === 'ready' || this.state.loadStatus() === 'empty';
    const settings: TabItem = {
      id: 'settings',
      label: 'Settings',
      link: this.breakpoint.isMobile() ? SETTINGS_ROUTE : GENERAL_SETTINGS_ROUTE,
    };
    return [
      { id: 'overview', label: 'Overview', link: WORKSPACE_ROUTE },
      {
        id: 'members',
        label: 'Members',
        link: MEMBERS_ROUTE,
        count: ready ? this.state.memberDirectory().length : undefined,
      },
      ...(this.state.access().isGuest ? [] : [settings]),
    ];
  });
}
