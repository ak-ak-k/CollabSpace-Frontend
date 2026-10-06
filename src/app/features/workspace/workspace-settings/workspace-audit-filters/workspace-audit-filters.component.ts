import { Component, input, model } from '@angular/core';
import { RadioGroupComponent } from '../../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import {
  AUDIT_CATEGORY_CHIPS,
  AUDIT_DATE_OPTIONS,
  AuditCategory,
  AuditFilters,
  isAuditDateRange,
} from '../audit-log-view';

@Component({
  selector: 'app-workspace-audit-filters',
  imports: [RadioGroupComponent, SelectComponent],
  templateUrl: './workspace-audit-filters.component.html',
  styleUrl: './workspace-audit-filters.component.scss',
})
export class WorkspaceAuditFiltersComponent {
  readonly filters = model.required<AuditFilters>();
  readonly actorOptions = input.required<readonly SelectOption[]>();

  protected readonly categoryChips = AUDIT_CATEGORY_CHIPS;
  protected readonly dateOptions = AUDIT_DATE_OPTIONS;

  protected setCategory(category: AuditCategory): void {
    this.filters.update((filters) => ({ ...filters, category }));
  }

  protected setActor(actorId: string): void {
    this.filters.update((filters) => ({ ...filters, actorId }));
  }

  protected setRange(range: string): void {
    if (isAuditDateRange(range)) {
      this.filters.update((filters) => ({ ...filters, range }));
    }
  }
}
