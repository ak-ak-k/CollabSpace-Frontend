import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { devModeGuard } from './core/guards/dev-mode.guard';

export const routes: Routes = [
  {
    path: 'styleguide',
    title: 'Styleguide · CollabSpace',
    canMatch: [devModeGuard],
    loadComponent: () =>
      import('./features/styleguide/styleguide.component').then(
        (module) => module.StyleguideComponent,
      ),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((module) => module.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((module) => module.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Dashboard · CollabSpace',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (module) => module.DashboardComponent,
          ),
      },
      {
        path: 'messages',
        title: 'Messages · CollabSpace',
        loadChildren: () =>
          import('./features/messages/messages.routes').then((module) => module.MESSAGES_ROUTES),
      },
      {
        path: 'teams',
        title: 'Teams · CollabSpace',
        loadChildren: () =>
          import('./features/teams/teams.routes').then((module) => module.TEAMS_ROUTES),
      },
      {
        path: '**',
        title: 'Page not found · CollabSpace',
        loadComponent: () =>
          import('./features/system/not-found/not-found.component').then(
            (module) => module.NotFoundComponent,
          ),
      },
    ],
  },
];
