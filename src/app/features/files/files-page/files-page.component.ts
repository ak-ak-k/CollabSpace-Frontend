import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FileView } from '../../../core/models/file-item';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { FileState } from '../../../core/state/file.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { FileActions } from '../file-actions.service';
import {
  ALL_FILE_TYPES,
  DEFAULT_FILE_FOLDER,
  DEFAULT_FILE_SORT,
  FILE_FOLDERS,
  FILES_PER_PAGE,
  FileSort,
  FileSortKey,
  folderMeta,
  folderOf,
  nextSort,
} from '../files-options';
import { FilesGridComponent } from '../files-grid/files-grid.component';
import { FilesListComponent } from '../files-list/files-list.component';
import { FilesSidebarComponent } from '../files-sidebar/files-sidebar.component';
import { FilesTableComponent } from '../files-table/files-table.component';
import { FilesToolbarComponent } from '../files-toolbar/files-toolbar.component';
import {
  countByFolder,
  emptyCopyFor,
  FileActionKind,
  FileActionRequest,
  FileRow,
  filterRows,
  hasActiveFilters,
  pageOf,
  sortRows,
  toFileRow,
} from '../files-view';

type FilesBody = 'table' | 'grid' | 'list';

const FIRST_PAGE = 1;

@Component({
  selector: 'app-files-page',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    FilesGridComponent,
    FilesListComponent,
    FilesSidebarComponent,
    FilesTableComponent,
    FilesToolbarComponent,
    IconComponent,
    PaginationComponent,
    SkeletonComponent,
    TabsComponent,
  ],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.scss',
})
export class FilesPageComponent {
  private readonly fileState = inject(FileState);
  private readonly workspace = inject(WorkspaceState);
  private readonly breakpoint = inject(BreakpointService);
  private readonly actions = inject(FileActions);

  readonly folder = input<FileView, string | undefined>(DEFAULT_FILE_FOLDER, {
    transform: folderOf,
  });

  protected readonly query = signal('');
  protected readonly type = signal<string>(ALL_FILE_TYPES);
  protected readonly layout = signal('list');
  protected readonly sort = signal<FileSort>(DEFAULT_FILE_SORT);
  protected readonly page = linkedSignal({
    source: () => [this.folder(), this.query(), this.type(), this.sort()] as const,
    computation: () => FIRST_PAGE,
  });

  protected readonly pageSize = FILES_PER_PAGE;
  protected readonly status = this.fileState.status;
  protected readonly isDesktop = this.breakpoint.isDesktop;
  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly meta = computed(() => folderMeta(this.folder()));

  private readonly allRows = computed(() => {
    const currentUserId = this.workspace.currentUser()?.id ?? '';
    const usersById = this.workspace.usersById();
    return this.fileState.files().map((file) => toFileRow(file, usersById, currentUserId));
  });
  private readonly filters = computed(() => ({
    folder: this.folder(),
    query: this.query(),
    type: this.type(),
  }));

  protected readonly rows = computed(() =>
    sortRows(filterRows(this.allRows(), this.filters()), this.sort()),
  );
  protected readonly pageRows = computed(() => pageOf(this.rows(), this.page(), FILES_PER_PAGE));
  protected readonly counts = computed(() =>
    this.status() === 'ready' ? countByFolder(this.allRows()) : null,
  );
  protected readonly usedBytes = computed(() =>
    this.fileState.files().reduce((total, file) => total + file.bytes, 0),
  );
  protected readonly tabs = computed<readonly TabItem[]>(() => {
    const counts = this.counts();
    return FILE_FOLDERS.map((folder) => ({
      id: folder.id,
      label: folder.label,
      count: counts?.[folder.id],
      link: ['/files', folder.id],
    }));
  });
  protected readonly body = computed<FilesBody>(() => {
    if (this.isMobile()) {
      return 'list';
    }
    return this.layout() === 'grid' ? 'grid' : 'table';
  });
  protected readonly emptyCopy = computed(() =>
    emptyCopyFor(this.folder(), this.status() === 'ready' && hasActiveFilters(this.filters())),
  );

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');

  private readonly handlers: Record<FileActionKind, (file: FileRow) => void> = {
    star: (file) => this.actions.toggleStar(file),
    download: (file) => this.actions.download(file),
    share: (file) => void this.actions.share(file),
    remove: (file) => void this.remove(file),
  };

  protected sortBy(key: FileSortKey): void {
    this.sort.update((sort) => nextSort(sort, key));
  }

  protected run(request: FileActionRequest): void {
    this.handlers[request.kind](request.file);
  }

  protected pickFiles(): void {
    this.picker().nativeElement.click();
  }

  protected uploadPicked(): void {
    const input = this.picker().nativeElement;
    const names = Array.from(input.files ?? [], (file) => file.name);
    input.value = '';
    void this.actions.upload(names);
  }

  protected reload(): void {
    void this.fileState.reload();
  }

  private async remove(file: FileRow): Promise<void> {
    if (await this.actions.remove(file)) {
      this.heading().nativeElement.focus();
    }
  }
}
