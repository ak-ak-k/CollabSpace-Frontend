import { computed, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { RouteAccessState } from '../core/state/route-access.state';
import { MORE_SECTION_ROUTES, SETTINGS_SECTION_ROUTE } from './navigation';

const CONVERSATION_ROUTE = /^\/messages\/[^/]+/;
const CHANNEL_ROUTE = /^\/teams\/[^/]+\/channels\/[^/]+/;

const pathOf = (url: string): string => url.split(/[?#]/)[0];

@Service()
export class CurrentRoute {
  private readonly router = inject(Router);
  private readonly access = inject(RouteAccessState);

  readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => pathOf(event.urlAfterRedirects)),
    ),
    { initialValue: pathOf(this.router.url) },
  );

  readonly inSettings = computed(() => this.path().startsWith(SETTINGS_SECTION_ROUTE));
  readonly inMoreSection = computed(() =>
    MORE_SECTION_ROUTES.some((route) => this.path().startsWith(route)),
  );
  readonly inConversation = computed(
    () =>
      (CONVERSATION_ROUTE.test(this.path()) || CHANNEL_ROUTE.test(this.path())) &&
      !this.access.conversationBlock() &&
      !this.access.teamBlock(),
  );
}
