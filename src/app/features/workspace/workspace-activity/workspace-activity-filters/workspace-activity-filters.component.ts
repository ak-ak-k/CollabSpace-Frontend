import { Component, input, model, viewChild } from '@angular/core';
import { RadioGroupComponent } from '../../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import {
  ACTIVITY_DATE_OPTIONS,
  ACTIVITY_OWNER_OPTIONS,
  ACTIVITY_TYPE_CHIPS,
  ActivityFeedFilters,
  ActivityType,
  isActivityDateRange,
  isActivityOwner,
} from '../activity-feed-view';

@Component({
  selector: 'app-workspace-activity-filters',
  imports: [RadioGroupComponent, SelectComponent],
  templateUrl: './workspace-activity-filters.component.html',
  styleUrl: './workspace-activity-filters.component.scss',
})
export class WorkspaceActivityFiltersComponent {
  readonly filters = model.required<ActivityFeedFilters>();
  readonly teamOptions = input.required<readonly SelectOption[]>();

  private readonly ownerGroup = viewChild.required<RadioGroupComponent>('ownerGroup');

  protected readonly ownerOptions = ACTIVITY_OWNER_OPTIONS;
  protected readonly dateOptions = ACTIVITY_DATE_OPTIONS;
  protected readonly typeChips = ACTIVITY_TYPE_CHIPS;

  focus(): void {
    this.ownerGroup().focus();
  }

  protected setOwner(owner: string): void {
    if (isActivityOwner(owner)) {
      this.filters.update((filters) => ({ ...filters, owner }));
    }
  }

  protected setTeam(teamId: string): void {
    this.filters.update((filters) => ({ ...filters, teamId }));
  }

  protected setRange(range: string): void {
    if (isActivityDateRange(range)) {
      this.filters.update((filters) => ({ ...filters, range }));
    }
  }

  protected setType(type: ActivityType): void {
    this.filters.update((filters) => ({ ...filters, type }));
  }
}
