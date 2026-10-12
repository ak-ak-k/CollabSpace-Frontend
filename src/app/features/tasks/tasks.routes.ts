import { Routes, UrlMatcher, UrlSegment } from '@angular/router';

const boardWithOptionalTask: UrlMatcher = (segments) => {
  if (segments.length > 1) {
    return null;
  }
  const posParams: Record<string, UrlSegment> = segments.length ? { taskId: segments[0] } : {};
  return { consumed: segments, posParams };
};

export const TASKS_ROUTES: Routes = [
  {
    matcher: boardWithOptionalTask,
    loadComponent: () =>
      import('./tasks-page/tasks-page.component').then((module) => module.TasksPageComponent),
  },
];
