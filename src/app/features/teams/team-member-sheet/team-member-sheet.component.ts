import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TeamMemberActionKind, TeamMemberMenuItem, TeamMemberView } from '../team-member-view';

export interface TeamMemberSheetData {
  readonly member: TeamMemberView;
  readonly items: readonly TeamMemberMenuItem[];
}

@Component({
  selector: 'app-team-member-sheet',
  imports: [CdkMenu, CdkMenuItem, IconComponent],
  templateUrl: './team-member-sheet.component.html',
  styleUrl: './team-member-sheet.component.scss',
})
export class TeamMemberSheetComponent {
  private readonly dialogRef = inject<DialogRef<TeamMemberActionKind>>(DialogRef);
  private readonly data = inject<TeamMemberSheetData>(DIALOG_DATA);

  protected readonly member = this.data.member;
  protected readonly items = this.data.items;

  protected choose(kind: TeamMemberActionKind): void {
    this.dialogRef.close(kind);
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.dialogRef.close();
  }
}
