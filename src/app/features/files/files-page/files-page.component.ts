import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FileView } from '../../../core/models/file-item';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { NetworkState } from '../../../core/state/network.state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { FileActions } from '../file-actions.service';
import { FileCatalog } from '../file-catalog.service';
import { FileFiltersDialog } from '../file-filters-dialog.service';
import { FilePreviewController } from '../file-preview/file-preview-controller';
import { FileUploads } from '../file-uploads.service';
import { FilesDropZoneDirective } from '../files-drop-zone.directive';
import { FilesFilterChipsComponent } from '../files-filter-chips/files-filter-chips.component';
import { FilesGridComponent } from '../files-grid/files-grid.component';
import { FilesHeaderComponent } from '../files-header/files-header.component';
import { FilesListComponent } from '../files-list/files-list.component';
import { DEFAULT_FILE_FOLDER, FILES_PER_PAGE, folderMeta, folderOf } from '../files-options';
import { FilesSidebarComponent } from '../files-sidebar/files-sidebar.component';
import { FilesTableComponent } from '../files-table/files-table.component';
import { FilesToolbarComponent } from '../files-toolbar/files-toolbar.component';
import { FilesUploadPanelComponent } from '../files-upload-panel/files-upload-panel.component';
import {
  countByFolder,
  EmptyAction,
  emptyCopyFor,
  FileActionKind,
  FileActionRequest,
  FileRow,
  pageOf,
} from '../files-view';
import { folderTabs, queryParamValue } from './files-page-options';
import { FilesQuery } from './files-query';

type FilesBody = 'table' | 'grid' | 'list';

const FIRST_PAGE = 1;

@Component({
  selector: 'app-files-page',
  imports: [
    EmptyStateComponent,
    FilesFilterChipsComponent,
    FilesGridComponent,
    FilesHeaderComponent,
    FilesListComponent,
    FilesSidebarComponent,
    FilesTableComponent,
    FilesToolbarComponent,
    FilesUploadPanelComponent,
    IconComponent,
    PaginationComponent,
    SkeletonComponent,
    TabsComponent,
  ],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.scss',
  hostDirectives: [FilesDropZoneDirective],
})
export class FilesPageComponent {
  private readonly dropZone = inject(FilesDropZoneDirective);
  private readonly catalog = inject(FileCatalog);
  private readonly breakpoint = inject(BreakpointService);
  private readonly actions = inject(FileActions);
  private readonly filtersDialog = inject(FileFiltersDialog);
  protected readonly uploads = inject(FileUploads);

  readonly folder = input<FileView, string | undefined>(DEFAULT_FILE_FOLDER, {
    transform: folderOf,
  });
  readonly file = input<string, string | null | undefined>('', { transform: queryParamValue });
  readonly team = input<string, string | null | undefined>('', { transform: queryParamValue });
  readonly conv = input<string, string | null | undefined>('', { transform: queryParamValue });

  protected readonly view = new FilesQuery({
    folder: this.folder,
    teamId: this.team,
    conversationId: this.conv,
  });
  protected readonly layout = signal('list');
  protected readonly filtersOpen = signal(false);
  protected readonly dragging = this.dropZone.dragging;
  protected readonly page = linkedSignal({
    source: () =>
      [
        this.folder(),
        this.view.search(),
        this.view.filters(),
        this.view.sort(),
        this.view.scope(),
      ] as const,
    computation: () => FIRST_PAGE,
  });

  protected readonly pageSize = FILES_PER_PAGE;
  protected readonly status = this.catalog.status;
  protected readonly isDesktop = this.breakpoint.isDesktop;
  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly offline = inject(NetworkState).offline;
  protected readonly meta = computed(() => folderMeta(this.folder()));
  protected readonly pageRows = computed(() =>
    pageOf(this.view.rows(), this.page(), FILES_PER_PAGE),
  );
  protected readonly counts = computed(() =>
    this.status() === 'ready' ? countByFolder(this.catalog.rows()) : null,
  );
  protected readonly usedBytes = computed(() =>
    this.catalog.files().reduce((total, file) => total + file.bytes, 0),
  );
  protected readonly tabs = computed(() => folderTabs(this.counts()));
  protected readonly body = computed<FilesBody>(() => {
    if (this.isMobile()) {
      return 'list';
    }
    return this.layout() === 'grid' ? 'grid' : 'table';
  });
  protected readonly emptyCopy = computed(() =>
    emptyCopyFor(this.folder(), this.status() === 'ready' && this.view.filtered()),
  );

  private readonly header = viewChild.required(FilesHeaderComponent);
  private readonly preview = new FilePreviewController({
    removeRequested: (fileId) => this.removeAfterPreview(fileId),
    focusLost: () => this.header().focusHeading(),
  });

  private readonly handlers: Record<FileActionKind, (file: FileRow) => void> = {
    preview: (file) => this.actions.preview(file.id),
    download: (file) => this.actions.download(file),
    star: (file) => this.actions.toggleStar(file),
    'copy-link': (file) => void this.actions.copyLink(file),
    source: (file) => this.actions.openSource(file),
    rename: (file) => void this.actions.rename(file),
    remove: (file) => void this.remove(file),
  };

  constructor() {
    this.dropZone.filesDropped.subscribe((files) => this.upload(files));
    effect(() => {
      const fileId = this.file();
      const settled = this.status() === 'ready' || this.status() === 'empty';
      untracked(() => this.preview.sync(fileId, settled));
    });
  }

  protected run(request: FileActionRequest): void {
    this.handlers[request.kind](request.file);
  }

  protected upload(files: readonly File[]): void {
    this.uploads.start(files, this.team() || null);
  }

  protected runEmptyAction(action: EmptyAction): void {
    if (action === 'upload') {
      this.header().pick();
    } else if (action === 'clear') {
      this.view.clearAll();
    }
  }

  protected openFilters(anchor: HTMLElement): void {
    this.filtersOpen.set(true);
    this.filtersDialog
      .open(anchor, this.view.dialogData())
      .closed.subscribe(() => this.filtersOpen.set(false));
  }

  protected reload(): void {
    void this.catalog.reload();
  }

  private async remove(file: FileRow): Promise<void> {
    if (await this.actions.remove(file)) {
      this.header().focusHeading();
    }
  }

  private removeAfterPreview(fileId: string): void {
    const file = this.catalog.row(fileId);
    if (file) {
      void this.remove(file);
    }
  }
}
