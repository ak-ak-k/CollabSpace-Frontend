import { booleanAttribute, Component, computed, input, model, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { PeopleLayout } from '../people-page-view';

const LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
  { value: 'list', label: 'List', icon: 'list' },
];

@Component({
  selector: 'app-people-toolbar',
  imports: [
    ButtonComponent,
    IconComponent,
    RadioGroupComponent,
    SearchInputComponent,
    SelectComponent,
  ],
  templateUrl: './people-toolbar.component.html',
  styleUrl: './people-toolbar.component.scss',
  host: { role: 'search', 'aria-label': 'Find people' },
})
export class PeopleToolbarComponent {
  readonly query = model('');
  readonly teamId = model('');
  readonly department = model('');
  readonly layout = model<PeopleLayout>('grid');
  readonly teamOptions = input.required<readonly SelectOption[]>();
  readonly departmentOptions = input.required<readonly SelectOption[]>();
  readonly activeFilterCount = input(0);
  readonly compact = input(false, { transform: booleanAttribute });
  readonly filtersOpen = input(false, { transform: booleanAttribute });
  readonly openFilters = output<void>();

  protected readonly hintId = 'people-search-hint';
  protected readonly layoutOptions = LAYOUT_OPTIONS;
  protected readonly filtersLabel = computed(() =>
    this.activeFilterCount() > 0 ? `Filters · ${this.activeFilterCount()}` : 'Filters',
  );

  protected clearQuery(event: Event): void {
    if (this.query()) {
      event.stopPropagation();
      this.query.set('');
    }
  }

  protected setLayout(value: string): void {
    this.layout.set(value === 'list' ? 'list' : 'grid');
  }
}
