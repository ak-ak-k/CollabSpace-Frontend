import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent } from '../../../shared/ui/radio/radio-group.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { FILE_LAYOUT_OPTIONS } from '../files-options';

const FILTER_SEPARATOR = ' · ';

@Component({
  selector: 'app-files-toolbar',
  imports: [ButtonComponent, IconComponent, RadioGroupComponent, SearchInputComponent],
  templateUrl: './files-toolbar.component.html',
  styleUrl: './files-toolbar.component.scss',
})
export class FilesToolbarComponent {
  readonly query = model('');
  readonly layout = model('list');
  readonly filterCount = input(0);
  readonly filtersOpen = input(false, { transform: booleanAttribute });
  readonly showLayout = input(true, { transform: booleanAttribute });
  readonly openFilters = output<HTMLElement>();

  private readonly trigger = viewChild.required('trigger', { read: ElementRef<HTMLElement> });

  protected readonly layoutOptions = FILE_LAYOUT_OPTIONS;
  protected readonly filterLabel = computed(() =>
    this.filterCount() ? `Filters${FILTER_SEPARATOR}${this.filterCount()}` : 'Filters',
  );

  protected requestFilters(): void {
    this.openFilters.emit(this.trigger().nativeElement);
  }
}
