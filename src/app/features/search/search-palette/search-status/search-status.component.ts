import { Component, computed, input, output } from '@angular/core';
import { formatCount } from '../../../../shared/pipes/count.pipe';
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
  readonly local = input(false);
  readonly retry = output<void>();

  private readonly scope = computed(() => (this.local() ? ' on this device' : ''));

  protected readonly liveCount = computed(() => {
    switch (this.status()) {
      case 'results':
        return `${formatCount(this.total(), 'result')}${this.scope()} for ${this.term()}`;
      case 'empty':
        return `No results${this.scope()} for ${this.term()}`;
      default:
        return '';
    }
  });
}
