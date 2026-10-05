import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal, WritableSignal } from '@angular/core';
import { ALL_DEPARTMENTS, ALL_TEAMS } from '../../../core/state/people-view';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { peopleCount } from '../people-page-view';

export interface PeopleFiltersSheetData {
  readonly teamId: WritableSignal<string>;
  readonly department: WritableSignal<string>;
  readonly teamOptions: Signal<readonly SelectOption[]>;
  readonly departmentOptions: Signal<readonly SelectOption[]>;
  readonly resultCount: Signal<number>;
}

@Component({
  selector: 'app-people-filters-sheet',
  imports: [ButtonComponent, IconButtonComponent, IconComponent, SelectComponent],
  templateUrl: './people-filters-sheet.component.html',
  styleUrl: './people-filters-sheet.component.scss',
})
export class PeopleFiltersSheetComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly data = inject<PeopleFiltersSheetData>(DIALOG_DATA);

  protected readonly titleId = createOverlayId('people-filters-title');
  protected readonly teamId = this.data.teamId;
  protected readonly department = this.data.department;
  protected readonly teamOptions = this.data.teamOptions;
  protected readonly departmentOptions = this.data.departmentOptions;
  protected readonly showLabel = computed(() => `Show ${peopleCount(this.data.resultCount())}`);

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected clear(): void {
    this.teamId.set(ALL_TEAMS);
    this.department.set(ALL_DEPARTMENTS);
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
