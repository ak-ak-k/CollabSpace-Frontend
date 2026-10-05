import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileChipRemoval, FileFilterChip } from '../files-filters';

@Component({
  selector: 'app-files-filter-chips',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './files-filter-chips.component.html',
  styleUrl: './files-filter-chips.component.scss',
})
export class FilesFilterChipsComponent {
  readonly chips = input.required<readonly FileFilterChip[]>();
  readonly remove = output<FileChipRemoval>();
  readonly clearAll = output<void>();
}
