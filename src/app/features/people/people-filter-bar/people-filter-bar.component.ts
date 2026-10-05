import { booleanAttribute, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeopleStatusFilter } from '../../../core/state/people-view';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { ActiveFilter, ActiveFilterKind, StatusChip } from '../people-page-view';

@Component({
  selector: 'app-people-filter-bar',
  imports: [ButtonComponent, IconComponent, RouterLink, StatusDotComponent],
  templateUrl: './people-filter-bar.component.html',
  styleUrl: './people-filter-bar.component.scss',
})
export class PeopleFilterBarComponent {
  readonly chips = input.required<readonly StatusChip[]>();
  readonly current = input.required<PeopleStatusFilter>();
  readonly showCounts = input(false, { transform: booleanAttribute });
  readonly activeFilters = input<readonly ActiveFilter[]>([]);
  readonly remove = output<ActiveFilterKind>();
  readonly clearAll = output<void>();
}
