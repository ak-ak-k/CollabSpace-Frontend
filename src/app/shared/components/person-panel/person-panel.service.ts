import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { PersonActions } from './person-actions.service';
import { PersonPanelComponent, PersonPanelData, PersonPanelResult } from './person-panel.component';

export interface PersonPanelOptions {
  readonly onChangeRole?: () => void;
}

const PANEL_WIDTH = 'var(--person-panel-width)';

@Service()
export class PersonPanelService {
  private readonly dialogs = inject(DialogService);
  private readonly actions = inject(PersonActions);

  open(userId: string, options: PersonPanelOptions = {}): DialogRef<PersonPanelResult> {
    const panel = this.dialogs.openDrawer<PersonPanelResult, PersonPanelData>(
      PersonPanelComponent,
      {
        data: { userId, canChangeRole: !!options.onChangeRole },
        side: 'right',
      },
    );
    panel.updateSize(PANEL_WIDTH);
    panel.closed.subscribe((result) => {
      if (result === 'message') {
        void this.actions.message(userId);
      } else if (result === 'role') {
        options.onChangeRole?.();
      }
    });
    return panel;
  }
}
