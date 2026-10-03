import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Workspace } from '../core/models/workspace';
import { ToastService } from '../core/services/toast.service';
import { WorkspaceState } from '../core/state/workspace.state';

const SECTION_ROOTS = ['/messages', '/teams', '/tasks'];

const isInside = (url: string, root: string): boolean =>
  url.startsWith(`${root}/`) || url.startsWith(`${root}?`);

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
    const root = SECTION_ROOTS.find((section) => isInside(this.router.url, section));
    if (root) {
      void this.router.navigateByUrl(root);
    }
    this.toasts.show(`Switched to ${target.name}`, { icon: 'building-2' });
  }
}
