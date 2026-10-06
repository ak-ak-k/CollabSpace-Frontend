import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  viewChildren,
} from '@angular/core';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { WorkspaceActivityState } from '../../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import {
  AUDIT_PAGE_SIZE,
  auditActorLabelOf,
  auditActorOptionsOf,
  auditEmptyCopyOf,
  AuditFilters,
  auditRowOf,
  DEFAULT_AUDIT_FILTERS,
  filterAuditEvents,
  isAuditFiltered,
} from '../audit-log-view';
import { WorkspaceAuditFiltersComponent } from '../workspace-audit-filters/workspace-audit-filters.component';

@Component({
  selector: 'app-workspace-settings-audit',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TableComponent,
    WorkspaceAuditFiltersComponent,
  ],
  templateUrl: './workspace-settings-audit.component.html',
  styleUrl: './workspace-settings-audit.component.scss',
})
export class WorkspaceSettingsAuditComponent {
  private readonly activity = inject(WorkspaceActivityState);
  private readonly workspace = inject(WorkspaceState);
  private readonly injector = inject(Injector);

  private readonly entries = viewChildren<ElementRef<HTMLElement>>('entry');

  protected readonly listLabel = 'Audit log, newest first';
  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly status = this.activity.status;
  protected readonly filters = signal<AuditFilters>(DEFAULT_AUDIT_FILTERS);
  protected readonly limit = linkedSignal({
    source: this.filters,
    computation: () => AUDIT_PAGE_SIZE,
  });

  private readonly auditEvents = computed(() => this.activity.events({ category: 'audit' }));
  private readonly matching = computed(() =>
    filterAuditEvents(this.auditEvents(), this.filters(), Date.now()),
  );
  private readonly currentUserId = computed(() => this.workspace.currentUser()?.id ?? null);
  private readonly nameOf = (userId: string): string | null =>
    this.workspace.user(userId)?.name ?? null;

  protected readonly actorOptions = computed(() =>
    auditActorOptionsOf(this.auditEvents(), this.currentUserId(), this.nameOf),
  );
  protected readonly rows = computed(() => {
    const currentUserId = this.currentUserId();
    return this.matching()
      .slice(0, this.limit())
      .map((event) =>
        auditRowOf(event, auditActorLabelOf(event.actorId, currentUserId, this.nameOf)),
      );
  });
  protected readonly hasMore = computed(() => this.matching().length > this.limit());
  protected readonly emptyCopy = computed(() => auditEmptyCopyOf(isAuditFiltered(this.filters())));

  protected loadMore(): void {
    const firstNewEntry = this.limit();
    this.limit.update((limit) => limit + AUDIT_PAGE_SIZE);
    afterNextRender(() => this.entries()[firstNewEntry]?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected retry(): void {
    void this.activity.reload();
  }
}
