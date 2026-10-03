import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { SearchData, SearchGroup } from '../../../core/data/search.data';
import { SearchFilter, SearchService } from '../../../core/services/search.service';
import { WorkspaceState } from '../../../core/state/workspace.state';

export const SEARCH_DEBOUNCE_MS = 220;

export type SearchStatus = 'idle' | 'searching' | 'refreshing' | 'failed' | 'empty' | 'results';

@Service({ autoProvided: false })
export class SearchSession {
  private readonly data = inject(SearchData);
  private readonly initialFilter = inject(SearchService).filter();
  private readonly workspace = inject(WorkspaceState);

  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private latestRequest = 0;

  readonly query = signal('');
  readonly filter = signal<SearchFilter>(this.initialFilter);
  readonly groups = signal<readonly SearchGroup[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);

  readonly term = computed(() => this.query().trim());
  readonly hasQuery = computed(() => this.term().length > 0);
  readonly total = computed(() => this.groups().reduce((total, group) => total + group.total, 0));
  readonly status = computed<SearchStatus>(() => {
    if (!this.hasQuery()) {
      return 'idle';
    }
    if (this.loading()) {
      return this.total() > 0 ? 'refreshing' : 'searching';
    }
    if (this.failed()) {
      return 'failed';
    }
    return this.total() > 0 ? 'results' : 'empty';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelPending());
  }

  setQuery(query: string): void {
    this.query.set(query);
    this.schedule();
  }

  setFilter(filter: SearchFilter): void {
    this.filter.set(filter);
    this.schedule();
  }

  private schedule(): void {
    this.cancelPending();
    this.failed.set(false);
    if (!this.hasQuery()) {
      this.groups.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const request = this.latestRequest;
    this.pendingTimer = setTimeout(() => void this.run(request), SEARCH_DEBOUNCE_MS);
  }

  private cancelPending(): void {
    this.latestRequest += 1;
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  private async run(request: number): Promise<void> {
    try {
      this.finish(
        request,
        await this.data.search(this.term(), this.filter(), {
          workspaceId: this.workspace.currentWorkspaceId(),
          memberIds: this.workspace.memberIds(),
        }),
        false,
      );
    } catch {
      this.finish(request, [], true);
    }
  }

  private finish(request: number, groups: readonly SearchGroup[], failed: boolean): void {
    if (request !== this.latestRequest) {
      return;
    }
    this.groups.set(groups);
    this.failed.set(failed);
    this.loading.set(false);
  }
}
