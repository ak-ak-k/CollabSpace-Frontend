import { computed, effect, inject, Injector, Signal, untracked } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { WorkspaceState } from '../state/workspace.state';

export const FORBIDDEN_ROUTE = '/403';

export type WorkspaceAccessRule = (
  workspace: WorkspaceState,
  route: ActivatedRouteSnapshot,
) => boolean;

const whenTrue = (condition: Signal<boolean>, injector: Injector): Promise<void> => {
  if (untracked(condition)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const watcher = effect(
      () => {
        if (condition()) {
          watcher.destroy();
          resolve();
        }
      },
      { injector, manualCleanup: true },
    );
  });
};

export const workspaceAccessGuard =
  (rule: WorkspaceAccessRule): CanActivateFn =>
  async (route) => {
    const workspace = inject(WorkspaceState);
    const router = inject(Router);
    const settled = computed(() => workspace.accessKnown() || workspace.loadStatus() === 'error');
    await whenTrue(settled, inject(Injector));
    const allowed = !workspace.accessKnown() || rule(workspace, route);
    return allowed || new RedirectCommand(router.parseUrl(FORBIDDEN_ROUTE));
  };
