import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SortDirection, SortHeaderComponent } from '../../../shared/ui/table/sort-header.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { FileMenuComponent } from '../file-menu/file-menu.component';
import { FileSourceLinkComponent } from '../file-source-link/file-source-link.component';
import { FileTileComponent } from '../file-tile/file-tile.component';
import { FileSort, FileSortKey, sortDescription } from '../files-options';
import { FileActionKind, FileActionRequest, FileRow } from '../files-view';

@Component({
  selector: 'app-files-table',
  imports: [
    AvatarComponent,
    FileMenuComponent,
    FileSourceLinkComponent,
    FileTileComponent,
    IconButtonComponent,
    IconComponent,
    SortHeaderComponent,
    TableComponent,
  ],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss',
})
export class FilesTableComponent {
  readonly files = input.required<readonly FileRow[]>();
  readonly heading = input.required<string>();
  readonly sort = input.required<FileSort>();
  readonly wide = input(true, { transform: booleanAttribute });
  readonly sortBy = output<FileSortKey>();
  readonly action = output<FileActionRequest>();

  protected readonly caption = computed(
    () => `${this.heading()}, sorted by ${sortDescription(this.sort())}`,
  );

  protected directionOf(key: FileSortKey): SortDirection | null {
    const sort = this.sort();
    return sort.key === key ? sort.direction : null;
  }

  protected run(kind: FileActionKind, file: FileRow): void {
    this.action.emit({ kind, file });
  }
}
