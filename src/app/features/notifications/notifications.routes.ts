import { Routes, UrlMatcher } from '@angular/router';
import { isNotificationFilter } from './notifications-view';

const loadNotificationsPage = () =>
  import('./notifications-page/notifications-page.component').then(
    (module) => module.NotificationsPageComponent,
  );

const matchNotificationCategory: UrlMatcher = (segments) => {
  if (segments.length === 0) {
    return { consumed: [] };
  }
  const [category] = segments;
  return segments.length === 1 && isNotificationFilter(category.path)
    ? { consumed: segments, posParams: { category } }
    : null;
};

export const NOTIFICATIONS_ROUTES: Routes = [
  { matcher: matchNotificationCategory, loadComponent: loadNotificationsPage },
  { path: '**', redirectTo: '' },
];
