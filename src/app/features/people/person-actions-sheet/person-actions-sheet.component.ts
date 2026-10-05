import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import type { PersonMenuItem } from '../people-actions.service';
import { PersonRow } from '../people-page-view';

export interface PersonActionsSheetData {
  readonly person: PersonRow;
  readonly items: readonly PersonMenuItem[];
}

@Component({
  selector: 'app-person-actions-sheet',
  imports: [AvatarComponent, CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './person-actions-sheet.component.html',
  styleUrl: './person-actions-sheet.component.scss',
})
export class PersonActionsSheetComponent {
  private readonly dialogRef = inject<DialogRef<PersonMenuItem>>(DialogRef);
  private readonly data = inject<PersonActionsSheetData>(DIALOG_DATA);

  protected readonly person = this.data.person;
  protected readonly items = this.data.items;

  protected choose(item: PersonMenuItem): void {
    this.dialogRef.close(item);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
