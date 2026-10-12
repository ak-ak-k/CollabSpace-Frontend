import { inject, Service } from '@angular/core';
import { ConfirmOptions, DialogService } from './dialog.service';

export const HOME_SCREEN_HELP: ConfirmOptions = {
  title: 'Add CollabSpace to your Home Screen',
  body: 'In Safari, tap the Share button, then choose “Add to Home Screen”. CollabSpace then opens full screen, like an app.',
  confirmLabel: 'Got it',
  icon: 'smartphone',
  tone: 'neutral',
};

@Service()
export class HomeScreenHelp {
  private readonly dialogs = inject(DialogService);

  explain(): Promise<boolean> {
    return this.dialogs.confirm(HOME_SCREEN_HELP);
  }
}
