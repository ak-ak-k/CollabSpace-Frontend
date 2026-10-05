import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileActionKind, FileMenuItem } from '../files-view';

export interface FileMenuSheetData {
  readonly title: string;
  readonly items: readonly FileMenuItem[];
}

@Component({
  selector: 'app-file-menu-sheet',
  imports: [CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './file-menu-sheet.component.html',
  styleUrl: './file-menu-sheet.component.scss',
})
export class FileMenuSheetComponent {
  private readonly dialogRef = inject<DialogRef<FileActionKind>>(DialogRef);
  private readonly data = inject<FileMenuSheetData>(DIALOG_DATA);

  protected readonly title = this.data.title;
  protected readonly items = this.data.items;

  protected choose(kind: FileActionKind): void {
    this.dialogRef.close(kind);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
