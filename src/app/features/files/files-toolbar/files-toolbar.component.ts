import { booleanAttribute, Component, computed, input, model } from '@angular/core';
import { RadioGroupComponent } from '../../../shared/ui/radio/radio-group.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import {
  ALL_FILE_TYPES,
  DEFAULT_FILE_SORT,
  FILE_LAYOUT_OPTIONS,
  FILE_SORT_OPTIONS,
  FILE_TYPE_OPTIONS,
  FileSort,
  sortFromValue,
  sortValueOf,
} from '../files-options';

@Component({
  selector: 'app-files-toolbar',
  imports: [RadioGroupComponent, SearchInputComponent, SelectComponent],
  templateUrl: './files-toolbar.component.html',
  styleUrl: './files-toolbar.component.scss',
})
export class FilesToolbarComponent {
  readonly query = model('');
  readonly type = model(ALL_FILE_TYPES);
  readonly layout = model('list');
  readonly sort = model<FileSort>(DEFAULT_FILE_SORT);
  readonly showLayout = input(true, { transform: booleanAttribute });
  readonly showSort = input(false, { transform: booleanAttribute });

  protected readonly typeOptions = FILE_TYPE_OPTIONS;
  protected readonly sortOptions = FILE_SORT_OPTIONS;
  protected readonly layoutOptions = FILE_LAYOUT_OPTIONS;
  protected readonly sortValue = computed(() => sortValueOf(this.sort()));

  protected selectSort(value: string): void {
    this.sort.set(sortFromValue(value));
  }
}
