import { inject, Injector, Service } from '@angular/core';
import { Router } from '@angular/router';
import { SearchTarget } from '../../../core/data/search.data';
import { ThemeState } from '../../../core/state/theme.state';
import { PersonActions } from '../../../shared/components/person-panel/person-actions.service';
import { CommandAction } from './palette-commands';

@Service()
export class PaletteRunner {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeState);
  private readonly injector = inject(Injector);
  private readonly people = inject(PersonActions);

  open(target: SearchTarget): void {
    void this.router.navigate([target.path], { queryParams: target.queryParams });
  }

  message(userId: string): void {
    void this.people.message(userId);
  }

  run(action: CommandAction): void {
    switch (action.type) {
      case 'navigate':
        this.open({ path: action.path });
        break;
      case 'message-person':
        this.message(action.userId);
        break;
      case 'create-task':
        void this.createTask();
        break;
      case 'invite-people':
        void this.invitePeople();
        break;
      case 'toggle-theme':
        this.theme.toggle();
        break;
    }
  }

  private async createTask(): Promise<void> {
    const { TaskActions } = await import('../../tasks/task-actions.service');
    this.injector.get(TaskActions).newTask();
  }

  private async invitePeople(): Promise<void> {
    const { WorkspaceActions } = await import('../../workspace/workspace-actions.service');
    this.injector.get(WorkspaceActions).openInvite();
  }
}
