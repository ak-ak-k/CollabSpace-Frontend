import { Routes } from '@angular/router';

export const ACTIVITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./activity-page/activity-page.component').then(
        (module) => module.ActivityPageComponent,
      ),
  },
];
