import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../../../core/services/dialog.service';
import {
  AddPeopleDialogComponent,
  AddPeopleDialogData,
  AddPeopleDialogResult,
} from './add-people-dialog.component';

@Service()
export class AddPeopleDialog {
  private readonly dialogs = inject(DialogService);

  async open(data: AddPeopleDialogData): Promise<AddPeopleDialogResult> {
    const dialogRef = this.dialogs.open<AddPeopleDialogResult, AddPeopleDialogData>(
      AddPeopleDialogComponent,
      { data, size: 'md' },
    );
    return (await firstValueFrom(dialogRef.closed)) ?? [];
  }
}
