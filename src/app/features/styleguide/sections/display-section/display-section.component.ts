import { Component, computed, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import {
  SortDirection,
  SortHeaderComponent,
} from '../../../../shared/ui/table/sort-header.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { TabsComponent } from '../../../../shared/ui/tabs/tabs.component';
import {
  BREADCRUMB_ITEMS,
  COLUMN_TABS,
  EMPTY_STATE_EXAMPLES,
  FileSort,
  FileSortKey,
  FILTER_TABS,
  LOCATION_TABS,
  SECTION_TABS,
  SETTINGS_BREADCRUMB_ITEMS,
  SHARED_FILES,
  SKELETON_EXAMPLES,
  sortFiles,
  TEAM_CARDS,
} from './display-section.data';

const FIRST_PAGE = 1;
const FILES_PER_PAGE = 8;
const SKELETON_ROWS = 3;
const DEFAULT_FILE_SORT: FileSort = { key: 'modifiedOn', direction: 'desc' };

@Component({
  selector: 'app-styleguide-display-section',
  imports: [
    BreadcrumbComponent,
    CardComponent,
    EmptyStateComponent,
    PaginationComponent,
    SkeletonComponent,
    SortHeaderComponent,
    TableComponent,
    TabsComponent,
  ],
  templateUrl: './display-section.component.html',
  styleUrl: './display-section.component.scss',
})
export class DisplaySectionComponent {
  protected readonly filterTabs = FILTER_TABS;
  protected readonly sectionTabs = SECTION_TABS;
  protected readonly columnTabs = COLUMN_TABS;
  protected readonly locationTabs = LOCATION_TABS;
  protected readonly teamCards = TEAM_CARDS;
  protected readonly emptyStates = EMPTY_STATE_EXAMPLES;
  protected readonly skeletons = SKELETON_EXAMPLES;
  protected readonly breadcrumbItems = BREADCRUMB_ITEMS;
  protected readonly settingsBreadcrumbItems = SETTINGS_BREADCRUMB_ITEMS;
  protected readonly filesPerPage = FILES_PER_PAGE;
  protected readonly skeletonRows = SKELETON_ROWS;
  protected readonly fileCount = SHARED_FILES.length;

  protected readonly activeFilter = signal('all');
  protected readonly activeSection = signal('overview');
  protected readonly activeColumn = signal('progress');
  protected readonly activeLocation = signal('starred');
  protected readonly filePage = signal(FIRST_PAGE);
  protected readonly fileSort = signal(DEFAULT_FILE_SORT);
  protected readonly lastAction = signal('None yet');

  protected readonly visibleFiles = computed(() => {
    const firstIndex = (this.filePage() - FIRST_PAGE) * FILES_PER_PAGE;
    return sortFiles(SHARED_FILES, this.fileSort()).slice(firstIndex, firstIndex + FILES_PER_PAGE);
  });

  protected sortDirection(key: FileSortKey): SortDirection | null {
    const sort = this.fileSort();
    return sort.key === key ? sort.direction : null;
  }

  protected sortBy(key: FileSortKey): void {
    const flipped: SortDirection = this.sortDirection(key) === 'asc' ? 'desc' : 'asc';
    this.fileSort.set({ key, direction: flipped });
    this.filePage.set(FIRST_PAGE);
  }
}
