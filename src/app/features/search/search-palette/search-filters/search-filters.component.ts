import { Component, input, output } from '@angular/core';
import { SEARCH_GROUPS } from '../../../../core/data/search.data';
import { SearchFilter } from '../../../../core/services/search.service';
import { IconName } from '../../../../shared/ui/icon/icon-registry';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export interface SearchFilterChip {
  readonly key: SearchFilter;
  readonly label: string;
  readonly icon: IconName;
}

export type SearchFilterCounts = Readonly<Record<string, number>>;

export const SEARCH_FILTER_CHIPS: readonly SearchFilterChip[] = [
  { key: 'all', label: 'All', icon: 'layers' },
  ...SEARCH_GROUPS,
];

@Component({
  selector: 'app-search-filters',
  imports: [IconComponent],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.scss',
  host: { role: 'group', 'aria-label': 'Filter results' },
})
export class SearchFiltersComponent {
  readonly selected = input.required<SearchFilter>();
  readonly counts = input<SearchFilterCounts>({});
  readonly picked = output<SearchFilter>();

  protected readonly chips = SEARCH_FILTER_CHIPS;
}
