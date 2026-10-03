import { Component, input, output } from '@angular/core';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileMenuComponent } from '../file-menu/file-menu.component';
import { FileTileComponent } from '../file-tile/file-tile.component';
import { FileActionKind, FileActionRequest, FileRow } from '../files-view';

@Component({
  selector: 'app-files-grid',
  imports: [FileMenuComponent, FileTileComponent, IconButtonComponent, IconComponent],
  templateUrl: './files-grid.component.html',
  styleUrl: './files-grid.component.scss',
})
export class FilesGridComponent {
  readonly files = input.required<readonly FileRow[]>();
  readonly action = output<FileActionRequest>();

  protected run(kind: FileActionKind, file: FileRow): void {
    this.action.emit({ kind, file });
  }
}
