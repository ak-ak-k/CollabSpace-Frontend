import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { SearchStatus } from '../search-session';

@Component({
  selector: 'app-search-status',
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './search-status.component.html',
  styleUrl: './search-status.component.scss',
  host: { role: 'status' },
})
export class SearchStatusComponent {
  readonly status = input.required<SearchStatus>();
  readonly term = input('');
  readonly total = input(0);

  protected readonly resultCount = computed(() =>
    this.total() === 1 ? '1 result' : `${this.total()} results`,
  );
}
