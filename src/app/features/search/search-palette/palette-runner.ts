import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { SearchTarget } from '../../../core/data/search.data';
import { DialogService } from '../../../core/services/dialog.service';
import { ThemeState } from '../../../core/state/theme.state';
import { CommandAction } from './palette-commands';

@Service()
export class PaletteRunner {
  private readonly router = inject(Router);
  private readonly dialogs = inject(DialogService);
  private readonly theme = inject(ThemeState);

  open(target: SearchTarget): void {
    void this.router.navigate([target.path], { queryParams: target.queryParams });
  }

  run(action: CommandAction): void {
    switch (action.type) {
      case 'navigate':
        this.open({ path: action.path });
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
    const { TaskDialogComponent } = await import('../../tasks/task-dialog/task-dialog.component');
    this.dialogs.open(TaskDialogComponent, { size: 'lg' });
  }

  private async invitePeople(): Promise<void> {
    const { InviteDialogComponent } =
      await import('../../teams/invite-dialog/invite-dialog.component');
    this.dialogs.open(InviteDialogComponent, { size: 'md' });
  }
}
