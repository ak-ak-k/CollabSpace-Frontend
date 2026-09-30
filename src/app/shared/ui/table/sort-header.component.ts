import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

export type SortDirection = 'asc' | 'desc';
export type AriaSort = 'ascending' | 'descending' | 'none';

const UNSORTED_ICON: IconName = 'arrow-down-up';
const SORTED_ICONS: Record<SortDirection, IconName> = { asc: 'arrow-up', desc: 'arrow-down' };
const ARIA_SORT_VALUES: Record<SortDirection, AriaSort> = { asc: 'ascending', desc: 'descending' };

@Component({
  selector: 'th[appSortHeader]',
  imports: [IconComponent],
  templateUrl: './sort-header.component.html',
  styleUrl: './sort-header.component.scss',
  host: {
    scope: 'col',
    '[attr.aria-sort]': 'ariaSort()',
    '[class.sort-header--sorted]': 'direction() !== null',
  },
})
export class SortHeaderComponent {
  readonly direction = input<SortDirection | null>(null);
  readonly sort = output<void>();

  protected readonly ariaSort = computed<AriaSort>(() => {
    const direction = this.direction();
    return direction ? ARIA_SORT_VALUES[direction] : 'none';
  });
  protected readonly icon = computed<IconName>(() => {
    const direction = this.direction();
    return direction ? SORTED_ICONS[direction] : UNSORTED_ICON;
  });
}
