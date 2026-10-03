import { ResolveFn, Route, Routes } from '@angular/router';
import { MOVED_SETTINGS_REDIRECTS, settingsTitleOf } from './settings-sections';

const loadSettingsPage = () =>
  import('./settings-page/settings-page.component').then((module) => module.SettingsPageComponent);

const settingsTitle: ResolveFn<string> = (route) => settingsTitleOf(route.paramMap.get('section'));

const MOVED_SETTINGS_ROUTES: Routes = Object.entries(MOVED_SETTINGS_REDIRECTS).map(
  ([path, redirectTo]): Route => ({ path, redirectTo, pathMatch: 'full' }),
);

export const SETTINGS_ROUTES: Routes = [
  { path: '', title: settingsTitle, loadComponent: loadSettingsPage },
  ...MOVED_SETTINGS_ROUTES,
  { path: ':section', title: settingsTitle, loadComponent: loadSettingsPage },
];
