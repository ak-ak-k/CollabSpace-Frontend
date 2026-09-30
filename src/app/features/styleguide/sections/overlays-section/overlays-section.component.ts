import { Component, inject, signal } from '@angular/core';
import { DialogService, DrawerSide } from '../../../../core/services/dialog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { DROPDOWN_IMPORTS } from '../../../../shared/ui/dropdown/dropdown-imports';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { TooltipPosition } from '../../../../shared/ui/tooltip/tooltip-position';
import { TooltipDirective } from '../../../../shared/ui/tooltip/tooltip.directive';
import { DemoDrawerComponent, DemoDrawerData } from './demo-drawer/demo-drawer.component';
import { DemoFormDialogComponent } from './demo-form-dialog/demo-form-dialog.component';

interface StatusOption {
  readonly value: string;
  readonly label: string;
}

const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 'online', label: 'Online' },
  { value: 'away', label: 'Away' },
  { value: 'dnd', label: 'Do not disturb' },
];
const TOOLTIP_POSITIONS: readonly TooltipPosition[] = ['top', 'right', 'bottom', 'left'];
const LONG_TOAST_MESSAGE =
  'Priya Raman added you to Atlas Web · Sprint 24 and assigned you three tasks that are due before the end of this week.';

@Component({
  selector: 'app-styleguide-overlays-section',
  imports: [ButtonComponent, IconComponent, TooltipDirective, DROPDOWN_IMPORTS],
  templateUrl: './overlays-section.component.html',
  styleUrl: './overlays-section.component.scss',
})
export class OverlaysSectionComponent {
  private readonly toasts = inject(ToastService);
  private readonly dialogs = inject(DialogService);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly tooltipPositions = TOOLTIP_POSITIONS;
  protected readonly status = signal(STATUS_OPTIONS[0].value);
  protected readonly muted = signal(false);
  protected readonly modalResult = signal('No modal opened yet.');
  protected readonly confirmResult = signal('No confirmation requested yet.');
  protected readonly menuResult = signal('No menu action chosen yet.');

  protected showPlainToast(): void {
    this.toasts.show('Link copied to clipboard');
  }

  protected showUndoToast(): void {
    this.toasts.show('Conversation archived', {
      icon: 'archive',
      actionLabel: 'Undo',
      onAction: () => this.toasts.show('Conversation restored', { icon: 'history' }),
    });
  }

  protected showLongToast(): void {
    this.toasts.show(LONG_TOAST_MESSAGE, { icon: 'bell' });
  }

  protected openFormModal(): void {
    const dialogRef = this.dialogs.open<string>(DemoFormDialogComponent);
    dialogRef.closed.subscribe((groupName) =>
      this.modalResult.set(groupName ? `Created group “${groupName}”.` : 'Modal dismissed.'),
    );
  }

  protected async confirmDelete(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: 'Delete this task?',
      body: 'The task, its comments and its attachments are removed for everyone.',
      confirmLabel: 'Delete task',
      icon: 'trash-2',
      tone: 'danger',
    });
    this.confirmResult.set(`Delete task: ${this.describe(confirmed)}.`);
  }

  protected async confirmSignOut(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: 'Sign out of CollabSpace?',
      body: 'You can sign back in at any time. Unsent drafts stay on this device.',
      confirmLabel: 'Sign out',
      icon: 'log-out',
      tone: 'neutral',
    });
    this.confirmResult.set(`Sign out: ${this.describe(confirmed)}.`);
  }

  protected openDrawer(side: DrawerSide): void {
    this.dialogs.openDrawer<void, DemoDrawerData>(DemoDrawerComponent, {
      side,
      size: side === 'left' ? 'sm' : 'md',
      data: { heading: side === 'left' ? 'Menu' : 'Details' },
    });
  }

  protected toggleMuted(): void {
    this.muted.update((muted) => !muted);
  }

  private describe(confirmed: boolean): string {
    return confirmed ? 'confirmed' : 'cancelled';
  }
}
