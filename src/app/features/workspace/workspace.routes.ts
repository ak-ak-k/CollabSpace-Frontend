import { Route, Routes } from '@angular/router';
import { workspaceAccessGuard } from '../../core/guards/workspace-access.guard';
import { canOpenWorkspaceSettings } from './workspace-settings/workspace-settings-sections';

const loadOverview = () =>
  import('./workspace-overview/workspace-overview.component').then(
    (module) => module.WorkspaceOverviewComponent,
  );

const loadMembers = () =>
  import('./workspace-members/workspace-members.component').then(
    (module) => module.WorkspaceMembersComponent,
  );

const loadActivity = () =>
  import('./workspace-activity/workspace-activity.component').then(
    (module) => module.WorkspaceActivityComponent,
  );

const loadSettings = () =>
  import('./workspace-settings/workspace-settings.component').then(
    (module) => module.WorkspaceSettingsComponent,
  );

const settingsGuard = workspaceAccessGuard((workspace, route) =>
  canOpenWorkspaceSettings(
    route.paramMap.get('section'),
    workspace.access().isGuest,
    (permission) => workspace.can(permission),
  ),
);

const guardedSettings: Omit<Route, 'path'> = {
  loadComponent: loadSettings,
  canActivate: [settingsGuard],
  runGuardsAndResolvers: 'always',
};

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./workspace-page/workspace-page.component').then(
        (module) => module.WorkspacePageComponent,
      ),
    children: [
      { path: '', loadComponent: loadOverview },
      { path: 'members', loadComponent: loadMembers },
      { path: 'members/:filter', loadComponent: loadMembers },
      { path: 'activity', loadComponent: loadActivity },
      { path: 'settings', ...guardedSettings },
      { path: 'settings/:section', ...guardedSettings },
      { path: '**', redirectTo: '' },
    ],
  },
];
