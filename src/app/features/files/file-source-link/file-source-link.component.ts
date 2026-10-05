import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileSourceInfo } from '../../../core/models/file-source';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-file-source-link',
  imports: [IconComponent, RouterLink],
  templateUrl: './file-source-link.component.html',
  styleUrl: './file-source-link.component.scss',
})
export class FileSourceLinkComponent {
  readonly source = input.required<FileSourceInfo>();
  readonly iconSize = input(13);
}
