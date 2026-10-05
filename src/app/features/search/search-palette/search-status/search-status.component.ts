import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { SearchStatus } from '../search-session';

@Component({
  selector: 'app-search-status',
  imports: [ButtonComponent, IconComponent, SpinnerComponent],
  templateUrl: './search-status.component.html',
  styleUrl: './search-status.component.scss',
})
export class SearchStatusComponent {
  readonly status = input.required<SearchStatus>();
  readonly term = input('');
  readonly total = input(0);
  readonly retry = output<void>();

  protected readonly liveCount = computed(() => {
    switch (this.status()) {
      case 'results':
        return `${this.total() === 1 ? '1 result' : `${this.total()} results`} for ${this.term()}`;
      case 'empty':
        return `No results for ${this.term()}`;
      default:
        return '';
    }
  });
}
