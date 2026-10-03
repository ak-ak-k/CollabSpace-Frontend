import { Routes } from '@angular/router';
import { DEFAULT_FILE_FOLDER } from './files-options';

export const FILES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_FILE_FOLDER },
  {
    path: ':folder',
    loadComponent: () =>
      import('./files-page/files-page.component').then((module) => module.FilesPageComponent),
  },
];
