import { Component, input } from '@angular/core';
import { ScrollEdgesDirective } from '../tabs/scroll-edges.directive';

export type TableMinWidth = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-table',
  imports: [ScrollEdgesDirective],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  host: {
    '[class]': '"table--min-" + minWidth()',
  },
})
export class TableComponent {
  readonly label = input.required<string>();
  readonly minWidth = input<TableMinWidth>('none');
}
