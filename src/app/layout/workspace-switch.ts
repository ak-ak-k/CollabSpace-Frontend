import { LiveAnnouncer } from '@angular/cdk/a11y';
import { afterNextRender, EnvironmentInjector, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Workspace } from '../core/models/workspace';
import { ToastService } from '../core/services/toast.service';
import { WorkspaceState } from '../core/state/workspace.state';

export const SWITCH_LOADING_DURATION = 550;

const SECTION_ROOTS = ['/messages', '/teams', '/tasks'];

const isInside = (url: string, root: string): boolean =>
  url.startsWith(`${root}/`) || url.startsWith(`${root}?`);

@Service()
export class WorkspaceSwitch {
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(EnvironmentInjector);
  private loadingTimer?: ReturnType<typeof setTimeout>;

  switchTo(target: Workspace): void {
    if (target.id === this.workspace.currentWorkspaceId()) {
      return;
    }
    this.workspace.switchWorkspace(target.id);
    this.showLoading();
    const root = SECTION_ROOTS.find((section) => isInside(this.router.url, section));
    const navigation = root ? this.router.navigateByUrl(root) : Promise.resolve(true);
    void navigation.then(() => this.announceLoading(target.name));
    this.toasts.show(`Switched to ${target.name}`, { icon: 'building-2' });
  }

  private showLoading(): void {
    clearTimeout(this.loadingTimer);
    this.workspace.switching.set(true);
    this.loadingTimer = setTimeout(
      () => this.workspace.switching.set(false),
      SWITCH_LOADING_DURATION,
    );
  }

  private announceLoading(name: string): void {
    afterNextRender(
      () => queueMicrotask(() => void this.announcer.announce(`Loading ${name}`, 'polite')),
      { injector: this.injector },
    );
  }
}
