import { Component, inject, input, output, signal } from '@angular/core';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileActions } from '../file-actions.service';
import { FileTileComponent } from '../file-tile/file-tile.component';
import { FileActionKind, FileActionRequest, FileRow } from '../files-view';

@Component({
  selector: 'app-files-list',
  imports: [FileTileComponent, IconButtonComponent, IconComponent],
  templateUrl: './files-list.component.html',
  styleUrl: './files-list.component.scss',
})
export class FilesListComponent {
  private readonly actions = inject(FileActions);

  readonly files = input.required<readonly FileRow[]>();
  readonly action = output<FileActionRequest>();

  protected readonly sheetFileId = signal<string | null>(null);

  protected run(kind: FileActionKind, file: FileRow): void {
    this.action.emit({ kind, file });
  }

  protected openSheet(file: FileRow): void {
    this.sheetFileId.set(file.id);
    this.actions.openSheet(file).closed.subscribe((kind) => {
      this.sheetFileId.set(null);
      if (kind) {
        this.run(kind, file);
      }
    });
  }
}
