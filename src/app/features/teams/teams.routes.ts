import { Routes } from '@angular/router';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./teams-layout/teams-layout.component').then((module) => module.TeamsLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./team-directory/team-directory.component').then(
            (module) => module.TeamDirectoryComponent,
          ),
      },
      {
        path: ':teamId/c/:channelId',
        loadComponent: () =>
          import('./team-channel/team-channel.component').then(
            (module) => module.TeamChannelComponent,
          ),
      },
      {
        path: ':teamId',
        loadComponent: () =>
          import('./team-detail/team-detail.component').then(
            (module) => module.TeamDetailComponent,
          ),
      },
      {
        path: ':teamId/:tab',
        loadComponent: () =>
          import('./team-detail/team-detail.component').then(
            (module) => module.TeamDetailComponent,
          ),
      },
    ],
  },
];
