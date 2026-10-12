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
import { Router, RouterLink, UrlTree } from '@angular/router';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { NetworkState } from '../../../../core/state/network.state';
import { WorkspaceActivityState } from '../../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { OfflineNoteComponent } from '../../../../shared/components/offline-note/offline-note.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import {
  AUDIT_PAGE_SIZE,
  auditActorOptionsOf,
  auditCountLabel,
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
    IconComponent,
    OfflineNoteComponent,
    RouterLink,
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
  private readonly router = inject(Router);

  private readonly entries = viewChildren<ElementRef<HTMLElement>>('entry');

  protected readonly listLabel = 'Audit log, newest first';
  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly offline = inject(NetworkState).offline;
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
  protected readonly rows = computed(() =>
    this.activity.toRows(this.matching().slice(0, this.limit())).map(auditRowOf),
  );
  protected readonly hasMore = computed(() => this.matching().length > this.limit());
  protected readonly emptyCopy = computed(() => auditEmptyCopyOf(isAuditFiltered(this.filters())));
  protected readonly countLabel = computed(() =>
    auditCountLabel(this.matching().length, isAuditFiltered(this.filters())),
  );

  protected linkTo(route: string): UrlTree {
    return this.router.parseUrl(route);
  }

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
