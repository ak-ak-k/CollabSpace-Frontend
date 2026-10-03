import { DialogRef } from '@angular/cdk/dialog';
import { computed, inject, Service, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { WorkspaceSwitcherComponent } from './workspace-switcher.component';

const SHEET_MAX_HEIGHT = 'var(--workspace-switcher-sheet-max-height)';

@Service()
export class WorkspaceSwitcherSheet {
  private readonly dialogs = inject(DialogService);
  private readonly openSheet = signal<DialogRef | null>(null);

  readonly isOpen = computed(() => this.openSheet() !== null);

  open(): void {
    if (this.openSheet()) {
      return;
    }
    const sheet = this.dialogs.openDrawer(WorkspaceSwitcherComponent, { side: 'bottom' });
    sheet.overlayRef.updateSize({ maxHeight: SHEET_MAX_HEIGHT });
    this.openSheet.set(sheet);
    sheet.closed.subscribe(() => this.openSheet.set(null));
  }
}
