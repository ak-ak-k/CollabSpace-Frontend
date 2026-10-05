import { Routes } from '@angular/router';
import { authGuard, signedOutMatch } from './core/guards/auth.guard';
import { devModeGuard } from './core/guards/dev-mode.guard';
import { OfflineComponent } from './features/system/offline/offline.component';
import { ServerErrorComponent } from './features/system/server-error/server-error.component';
import { SystemLayoutComponent } from './layout/system-layout/system-layout.component';

const loadForbidden = () =>
  import('./features/system/forbidden/forbidden.component').then(
    (module) => module.ForbiddenComponent,
  );

const OFFLINE_TITLE = 'Offline · CollabSpace';
const FORBIDDEN_TITLE = 'Access denied · CollabSpace';
const SERVER_ERROR_TITLE = 'Something went wrong · CollabSpace';

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
    component: SystemLayoutComponent,
    children: [
      {
        path: 'session-expired',
        title: 'Session expired · CollabSpace',
        loadComponent: () =>
          import('./features/system/session-expired/session-expired.component').then(
            (module) => module.SessionExpiredComponent,
          ),
      },
      {
        path: 'offline',
        title: OFFLINE_TITLE,
        canMatch: [signedOutMatch],
        component: OfflineComponent,
      },
      {
        path: '403',
        title: FORBIDDEN_TITLE,
        canMatch: [signedOutMatch],
        loadComponent: loadForbidden,
      },
      {
        path: '500',
        title: SERVER_ERROR_TITLE,
        canMatch: [signedOutMatch],
        component: ServerErrorComponent,
      },
    ],
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
        path: 'workspace',
        title: 'Workspace · CollabSpace',
        loadChildren: () =>
          import('./features/workspace/workspace.routes').then((module) => module.WORKSPACE_ROUTES),
      },
      {
        path: 'people',
        title: 'People · CollabSpace',
        loadChildren: () =>
          import('./features/people/people.routes').then((module) => module.PEOPLE_ROUTES),
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
        path: 'tasks',
        title: 'Tasks · CollabSpace',
        loadChildren: () =>
          import('./features/tasks/tasks.routes').then((module) => module.TASKS_ROUTES),
      },
      {
        path: 'files',
        title: 'Files · CollabSpace',
        loadChildren: () =>
          import('./features/files/files.routes').then((module) => module.FILES_ROUTES),
      },
      {
        path: 'notifications',
        title: 'Notifications · CollabSpace',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(
            (module) => module.NOTIFICATIONS_ROUTES,
          ),
      },
      {
        path: 'profile',
        title: 'Profile · CollabSpace',
        loadChildren: () =>
          import('./features/profile/profile.routes').then((module) => module.PROFILE_ROUTES),
      },
      {
        path: 'settings',
        title: 'Settings · CollabSpace',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((module) => module.SETTINGS_ROUTES),
      },
      { path: 'offline', title: OFFLINE_TITLE, component: OfflineComponent },
      { path: '403', title: FORBIDDEN_TITLE, loadComponent: loadForbidden },
      { path: '500', title: SERVER_ERROR_TITLE, component: ServerErrorComponent },
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
