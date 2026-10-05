import { Routes, UrlMatcher, UrlSegment } from '@angular/router';

const MAX_SEGMENTS = 1;

const peopleMatcher: UrlMatcher = (segments) => {
  if (segments.length > MAX_SEGMENTS) {
    return null;
  }
  const [filter] = segments;
  const posParams: Record<string, UrlSegment> = filter ? { filter } : {};
  return { consumed: segments, posParams };
};

export const PEOPLE_ROUTES: Routes = [
  {
    matcher: peopleMatcher,
    loadComponent: () =>
      import('./people-page/people-page.component').then((module) => module.PeoplePageComponent),
  },
];
