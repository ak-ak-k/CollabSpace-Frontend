import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';
import { NetworkState } from '../state/network.state';
import { ErrorReportService } from './error-report.service';

export const SERVER_ERROR_ROUTE = '/500';
const OFFLINE_ROUTE = '/offline';
const FALLBACK_ROUTES = [SERVER_ERROR_ROUTE, OFFLINE_ROUTE];

export const redirectNavigationError = (error: NavigationError): RedirectCommand | undefined => {
  if (FALLBACK_ROUTES.includes(error.url)) {
    return undefined;
  }
  const router = inject(Router);
  const offline = inject(NetworkState).offline();
  if (!offline) {
    inject(ErrorReportService).report();
  }
  return new RedirectCommand(router.parseUrl(offline ? OFFLINE_ROUTE : SERVER_ERROR_ROUTE), {
    browserUrl: error.url,
  });
};
