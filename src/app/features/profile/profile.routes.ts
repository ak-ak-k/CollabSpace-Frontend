import { Routes } from '@angular/router';

const loadProfilePage = () =>
  import('./profile-page/profile-page.component').then((module) => module.ProfilePageComponent);

export const PROFILE_ROUTES: Routes = [
  { path: '', loadComponent: loadProfilePage },
  { path: ':userId', loadComponent: loadProfilePage },
];
