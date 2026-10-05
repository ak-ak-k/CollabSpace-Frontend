import { computed, inject, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import { FileView } from '../../../core/models/file-item';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { FileCatalog } from '../file-catalog.service';
import {
  activeFilterCount,
  FileChipRemoval,
  FileFilterState,
  FileScope,
  filterChips,
  filterRows,
  NO_FILE_FILTERS,
  sortRows,
  withoutChip,
} from '../files-filters';
import { FileFiltersData } from '../files-filters/files-filters.component';
import { DEFAULT_FILE_SORT, FileSort, FileSortKey, nextSort } from '../files-options';
import { ownerChipName, ownerOptionsOf, teamOptionsOf } from './files-page-options';

export interface FilesQuerySource {
  readonly folder: Signal<FileView>;
  readonly teamId: Signal<string>;
  readonly conversationId: Signal<string>;
}

type ScopeParam = 'team' | 'conv';

export class FilesQuery {
  private readonly catalog = inject(FileCatalog);
  private readonly workspace = inject(WorkspaceState);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly filters = signal<FileFilterState>(NO_FILE_FILTERS);
  readonly sort = signal<FileSort>(DEFAULT_FILE_SORT);

  constructor(private readonly source: FilesQuerySource) {}

  readonly scope = computed<FileScope>(() => ({
    teamId: this.source.teamId(),
    conversationId: this.source.conversationId(),
    teamChannelIds: this.catalog.teamChannelIds(this.source.teamId()),
  }));
  readonly rows = computed(() =>
    sortRows(
      filterRows(this.catalog.rows(), {
        folder: this.source.folder(),
        search: this.search(),
        filters: this.filters(),
        scope: this.scope(),
        now: Date.now(),
      }),
      this.sort(),
    ),
  );
  readonly filterCount = computed(() => activeFilterCount(this.filters(), this.scope()));
  readonly filtered = computed(() => this.search().trim() !== '' || this.filterCount() > 0);
  readonly chips = computed(() => {
    const teamId = this.source.teamId();
    const ownerId = this.filters().ownerId;
    return filterChips(this.filters(), this.scope(), {
      teamName: this.workspace.team(teamId)?.name ?? teamId,
      conversationTitle: this.catalog.conversationTitle(this.source.conversationId()),
      ownerName: ownerChipName(
        ownerId,
        this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
        this.workspace.user(ownerId),
      ),
    });
  });

  sortBy(key: FileSortKey): void {
    this.sort.update((sort) => nextSort(sort, key));
  }

  removeChip(removal: FileChipRemoval): void {
    if (removal.kind === 'team') {
      this.setScope('team', '');
    } else if (removal.kind === 'conversation') {
      this.setScope('conv', '');
    } else {
      this.filters.update((filters) => withoutChip(filters, removal));
    }
  }

  clearAll(): void {
    this.search.set('');
    this.filters.set(NO_FILE_FILTERS);
    if (this.source.teamId() || this.source.conversationId()) {
      void this.router.navigate([], {
        queryParams: { team: null, conv: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  dialogData(): FileFiltersData {
    return {
      filters: this.filters,
      teamId: this.source.teamId,
      teamOptions: computed(() => teamOptionsOf(this.workspace.teams())),
      ownerOptions: computed(() => ownerOptionsOf(this.catalog.rows())),
      resultCount: computed(() => this.rows().length),
      selectTeam: (teamId) => this.setScope('team', teamId),
      clearAll: () => this.clearAll(),
    };
  }

  private setScope(param: ScopeParam, value: string): void {
    void this.router.navigate([], {
      queryParams: { [param]: value || null },
      queryParamsHandling: 'merge',
    });
  }
}
