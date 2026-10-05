import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal, WritableSignal } from '@angular/core';
import { FileType } from '../../../core/models/file-item';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { RadioGroupComponent } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { FileFilterState, toggleType } from '../files-filters';
import {
  FILE_MODIFIED_OPTIONS,
  FILE_SOURCE_OPTIONS,
  FILE_TYPE_OPTIONS,
  isModifiedFilter,
  isSourceFilter,
} from '../files-options';

export interface FileFiltersData {
  readonly filters: WritableSignal<FileFilterState>;
  readonly teamId: Signal<string>;
  readonly teamOptions: Signal<readonly SelectOption[]>;
  readonly ownerOptions: Signal<readonly SelectOption[]>;
  readonly resultCount: Signal<number>;
  readonly selectTeam: (teamId: string) => void;
  readonly clearAll: () => void;
}

@Component({
  selector: 'app-files-filters',
  imports: [
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    RadioGroupComponent,
    SelectComponent,
  ],
  templateUrl: './files-filters.component.html',
  styleUrl: './files-filters.component.scss',
})
export class FilesFiltersComponent {
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<FileFiltersData>(DIALOG_DATA);

  protected readonly titleId = createOverlayId('files-filters-title');
  protected readonly typeLabelId = `${this.titleId}-type`;
  protected readonly typeOptions = FILE_TYPE_OPTIONS;
  protected readonly sourceOptions = FILE_SOURCE_OPTIONS;
  protected readonly modifiedOptions = FILE_MODIFIED_OPTIONS;
  protected readonly filters = this.data.filters;
  protected readonly showLabel = computed(() => {
    const count = this.data.resultCount();
    return `Show ${count} ${count === 1 ? 'file' : 'files'}`;
  });

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected isTypeOn(type: FileType): boolean {
    return this.filters().types.includes(type);
  }

  protected toggle(type: FileType): void {
    this.filters.update((filters) => toggleType(filters, type));
  }

  protected setOwner(ownerId: string): void {
    this.filters.update((filters) => ({ ...filters, ownerId }));
  }

  protected setSource(source: string): void {
    if (isSourceFilter(source)) {
      this.filters.update((filters) => ({ ...filters, source }));
    }
  }

  protected setModified(modified: string): void {
    if (isModifiedFilter(modified)) {
      this.filters.update((filters) => ({ ...filters, modified }));
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
