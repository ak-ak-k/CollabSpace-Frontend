import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Workspace } from '../core/models/workspace';
import { ToastService } from '../core/services/toast.service';
import { WorkspaceState } from '../core/state/workspace.state';

const SECTION_ROOTS = ['/messages', '/teams', '/tasks'];
const PERMISSION_GUARDED_ROOTS = ['/workspace/settings'];

const isInside = (url: string, root: string): boolean =>
  url.startsWith(`${root}/`) || url.startsWith(`${root}?`);

const isAtOrInside = (url: string, root: string): boolean => url === root || isInside(url, root);

@Service()
export class WorkspaceSwitch {
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  switchTo(target: Workspace): void {
    if (target.id === this.workspace.currentWorkspaceId()) {
      return;
    }
    this.workspace.switchWorkspace(target.id);
    const url = this.router.url;
    const root = SECTION_ROOTS.find((section) => isInside(url, section));
    if (root) {
      void this.router.navigateByUrl(root);
    } else if (PERMISSION_GUARDED_ROOTS.some((guarded) => isAtOrInside(url, guarded))) {
      void this.router.navigateByUrl(url, { onSameUrlNavigation: 'reload', replaceUrl: true });
    }
    this.toasts.show(`Switched to ${target.name}`, { icon: 'building-2' });
  }
}
