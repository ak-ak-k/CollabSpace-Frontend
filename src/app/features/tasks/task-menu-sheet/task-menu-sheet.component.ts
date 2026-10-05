import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { afterNextRender, Component, inject, viewChild } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TaskMenuItem } from '../tasks-view';

export interface TaskMenuSheetData {
  readonly title: string;
  readonly label: string;
  readonly items: readonly TaskMenuItem[];
}

@Component({
  selector: 'app-task-menu-sheet',
  imports: [CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './task-menu-sheet.component.html',
  styleUrl: './task-menu-sheet.component.scss',
})
export class TaskMenuSheetComponent {
  private readonly dialogRef = inject<DialogRef<TaskMenuItem>>(DialogRef);
  protected readonly data = inject<TaskMenuSheetData>(DIALOG_DATA);
  private readonly menu = viewChild.required(CdkMenu);

  constructor() {
    afterNextRender(() => this.menu().focusFirstItem('keyboard'));
  }

  protected choose(item: TaskMenuItem): void {
    this.dialogRef.close(item);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
