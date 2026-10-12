import { Component, computed, input, model, viewChild } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { RadioGroupComponent } from '../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import {
  ACTIVITY_DATE_OPTIONS,
  ACTIVITY_OWNER_OPTIONS,
  ACTIVITY_TYPE_CHIPS,
  ActivityPageFilters,
  ActivityType,
  ANYONE,
  DEFAULT_ACTIVITY_FILTERS,
  isActivityDateRange,
  isActivityFiltered,
  isActivityOwner,
} from '../activity-page-view';

@Component({
  selector: 'app-activity-filters',
  imports: [ButtonComponent, RadioGroupComponent, SelectComponent],
  templateUrl: './activity-filters.component.html',
  styleUrl: './activity-filters.component.scss',
  host: { role: 'search', 'aria-label': 'Filter activity' },
})
export class ActivityFiltersComponent {
  readonly filters = model.required<ActivityPageFilters>();
  readonly teamOptions = input.required<readonly SelectOption[]>();
  readonly personOptions = input.required<readonly SelectOption[]>();

  private readonly ownerGroup = viewChild.required<RadioGroupComponent>('ownerGroup');

  protected readonly ownerOptions = ACTIVITY_OWNER_OPTIONS;
  protected readonly dateOptions = ACTIVITY_DATE_OPTIONS;
  protected readonly typeChips = ACTIVITY_TYPE_CHIPS;
  protected readonly filtered = computed(() => isActivityFiltered(this.filters()));

  focus(): void {
    this.ownerGroup().focus();
  }

  protected setOwner(owner: string): void {
    if (isActivityOwner(owner)) {
      this.filters.update((filters) => ({ ...filters, owner, personId: ANYONE }));
    }
  }

  protected setTeam(teamId: string): void {
    this.filters.update((filters) => ({ ...filters, teamId }));
  }

  protected setPerson(personId: string): void {
    this.filters.update((filters) => ({ ...filters, personId }));
  }

  protected setRange(range: string): void {
    if (isActivityDateRange(range)) {
      this.filters.update((filters) => ({ ...filters, range }));
    }
  }

  protected setType(type: ActivityType): void {
    this.filters.update((filters) => ({ ...filters, type }));
  }

  protected clear(): void {
    this.filters.set(DEFAULT_ACTIVITY_FILTERS);
    this.focus();
  }
}
