import { Routes } from '@angular/router';

const loadOverview = () =>
  import('./workspace-overview/workspace-overview.component').then(
    (module) => module.WorkspaceOverviewComponent,
  );

const loadMembers = () =>
  import('./workspace-members/workspace-members.component').then(
    (module) => module.WorkspaceMembersComponent,
  );

const loadSettings = () =>
  import('./workspace-settings/workspace-settings.component').then(
    (module) => module.WorkspaceSettingsComponent,
  );

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
      { path: 'settings', loadComponent: loadSettings },
      { path: 'settings/:section', loadComponent: loadSettings },
      { path: '**', redirectTo: '' },
    ],
  },
];
