import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileView } from '../../../core/models/file-item';
import { SecondarySidebarComponent } from '../../../layout/secondary-sidebar/secondary-sidebar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FILE_FOLDERS } from '../files-options';
import { FilesStorageComponent } from '../files-storage/files-storage.component';

@Component({
  selector: 'app-files-sidebar',
  imports: [RouterLink, SecondarySidebarComponent, IconComponent, FilesStorageComponent],
  templateUrl: './files-sidebar.component.html',
  styleUrl: './files-sidebar.component.scss',
})
export class FilesSidebarComponent {
  readonly active = input.required<FileView>();
  readonly counts = input<Readonly<Record<FileView, number>> | null>(null);
  readonly usedBytes = input(0);

  protected readonly folders = FILE_FOLDERS;
}
