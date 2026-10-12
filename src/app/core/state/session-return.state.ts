import { DOCUMENT, inject, Service } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { isReturnableRoute, returnRouteOf } from '../guards/return-route';

export const RETURN_ROUTE_STORAGE_KEY = 'collabspace.returnTo';

@Service()
export class SessionReturnState {
  private readonly storage = inject(DOCUMENT).defaultView?.sessionStorage;
  private lastAppRoute: string | null = null;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.remember(event.urlAfterRedirects));
  }

  remember(url: string): void {
    if (isReturnableRoute(url)) {
      this.lastAppRoute = url;
    }
  }

  stash(): void {
    if (!this.lastAppRoute) {
      return;
    }
    try {
      this.storage?.setItem(RETURN_ROUTE_STORAGE_KEY, this.lastAppRoute);
    } catch {
      return;
    }
  }

  take(): string | null {
    try {
      const stored = this.storage?.getItem(RETURN_ROUTE_STORAGE_KEY);
      this.storage?.removeItem(RETURN_ROUTE_STORAGE_KEY);
      return returnRouteOf(stored);
    } catch {
      return null;
    }
  }
}
