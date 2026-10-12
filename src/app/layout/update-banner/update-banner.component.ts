import { Component, computed, DOCUMENT, inject, output } from '@angular/core';
import { AppUpdateService } from '../../core/services/app-update.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { PendingWorkState } from '../../core/state/pending-work.state';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import {
  finishSyncingMessageOf,
  hasOpenDialog,
  hasUnsentText,
  RELOAD_CONFIRM,
  reloadStepOf,
  SIMULATED_UPDATE_MESSAGE,
  updateHintOf,
} from './update-banner-view';

@Component({
  selector: 'app-update-banner',
  imports: [IconComponent],
  templateUrl: './update-banner.component.html',
  styleUrl: './update-banner.component.scss',
  host: { role: 'status' },
})
export class UpdateBannerComponent {
  private readonly updates = inject(AppUpdateService);
  private readonly pending = inject(PendingWorkState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  readonly closed = output<void>();

  protected readonly hint = computed(() => updateHintOf(this.pending.pendingWork().total));

  protected async reload(): Promise<void> {
    const pendingChanges = this.pending.pendingWork().total;
    const step = reloadStepOf({
      pendingChanges,
      unsentText: hasUnsentText(this.document),
      dialogOpen: hasOpenDialog(this.document),
    });
    if (step === 'finish-syncing') {
      this.toasts.show(finishSyncingMessageOf(pendingChanges), { icon: 'clock' });
      return;
    }
    if (step === 'confirm' && !(await this.dialogs.confirm(RELOAD_CONFIRM))) {
      return;
    }
    await this.applyUpdate();
  }

  protected later(): void {
    this.updates.postpone();
    this.closed.emit();
  }

  private async applyUpdate(): Promise<void> {
    if ((await this.updates.activate()) === 'simulated') {
      this.toasts.show(SIMULATED_UPDATE_MESSAGE, { icon: 'refresh-cw' });
      this.closed.emit();
    }
  }
}
