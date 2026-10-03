import { Component, computed, input } from '@angular/core';
import { FILE_TYPE_ICONS, FileType } from '../../../core/models/file-item';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

export type FileTileSize = 'sm' | 'md' | 'preview';

const INVERTED_TYPES: ReadonlySet<FileType> = new Set(['pdf', 'design']);
const ICON_SIZES: Record<FileTileSize, number> = { sm: 16, md: 18, preview: 36 };

@Component({
  selector: 'app-file-tile',
  imports: [IconComponent],
  templateUrl: './file-tile.component.html',
  styleUrl: './file-tile.component.scss',
  host: {
    'aria-hidden': 'true',
    '[class]': '"file-tile--" + size()',
    '[class.file-tile--inverted]': 'inverted()',
  },
})
export class FileTileComponent {
  readonly type = input.required<FileType>();
  readonly size = input<FileTileSize>('sm');

  protected readonly icon = computed(() => FILE_TYPE_ICONS[this.type()]);
  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);
  protected readonly inverted = computed(() => INVERTED_TYPES.has(this.type()));
}
