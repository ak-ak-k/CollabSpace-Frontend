import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, input, output } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { DROPDOWN_IMPORTS } from '../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TaskActions } from '../task-actions.service';
import {
  TaskMenuSheetComponent,
  TaskMenuSheetData,
} from '../task-menu-sheet/task-menu-sheet.component';
import { TaskCardView, TaskMenuItem, taskMenuItems } from '../tasks-view';

export type TaskMenuAppearance = 'popover' | 'sheet';

const MENU_BELOW_END: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
};
const MENU_ABOVE_END: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'end',
  overlayY: 'bottom',
};

@Component({
  selector: 'app-task-menu',
  imports: [DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './task-menu.component.html',
  styleUrl: './task-menu.component.scss',
})
export class TaskMenuComponent {
  private readonly actions = inject(TaskActions);
  private readonly dialogs = inject(DialogService);

  readonly card = input.required<TaskCardView>();
  readonly appearance = input<TaskMenuAppearance>('popover');
  readonly moved = output<string>();

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly items = computed(() => taskMenuItems(this.card().status));

  protected openSheet(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const card = this.card();
    const data: TaskMenuSheetData = {
      title: card.menuTitle,
      label: card.menuLabel,
      items: this.items(),
    };
    this.dialogs
      .openDrawer<TaskMenuItem, TaskMenuSheetData>(TaskMenuSheetComponent, {
        side: 'bottom',
        ariaLabel: card.menuLabel,
        data,
      })
      .closed.subscribe((item) => {
        if (item) {
          void this.run(item);
        }
      });
  }

  protected async run(item: TaskMenuItem): Promise<void> {
    const taskId = this.card().id;
    if (item.kind === 'copy-link') {
      await this.actions.copyLink(taskId);
      return;
    }
    this.moved.emit(taskId);
    await this.actions.move(taskId, item.status);
  }
}
