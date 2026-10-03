import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { MemberActionKind, MemberMenuItem } from '../member-actions-view';
import { MemberRow } from '../members-view';

export interface MemberActionsSheetData {
  readonly member: MemberRow;
  readonly items: readonly MemberMenuItem[];
}

@Component({
  selector: 'app-member-actions-sheet',
  imports: [AvatarComponent, CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './member-actions-sheet.component.html',
  styleUrl: './member-actions-sheet.component.scss',
})
export class MemberActionsSheetComponent {
  private readonly dialogRef = inject<DialogRef<MemberActionKind>>(DialogRef);
  private readonly data = inject<MemberActionsSheetData>(DIALOG_DATA);

  protected readonly member = this.data.member;
  protected readonly items = this.data.items;

  protected choose(kind: MemberActionKind): void {
    this.dialogRef.close(kind);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
