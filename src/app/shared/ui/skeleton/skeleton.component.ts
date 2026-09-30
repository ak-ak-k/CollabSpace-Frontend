import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';
import { buildSkeletonView, SkeletonLayout } from './skeleton-layouts';

const DEFAULT_ROW_COUNT = 7;

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  host: {
    role: 'status',
    'aria-busy': 'true',
    '[attr.aria-label]': 'label()',
    '[class]': '"skeleton--" + view().arrangement',
    '[class.skeleton--compact]': 'compact()',
  },
})
export class SkeletonComponent {
  readonly layout = input<SkeletonLayout>('list');
  readonly rows = input(DEFAULT_ROW_COUNT, { transform: numberAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly label = input('Loading');

  protected readonly view = computed(() => buildSkeletonView(this.layout(), this.rows()));
}
