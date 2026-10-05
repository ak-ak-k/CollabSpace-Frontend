import { Component, computed, input, output } from '@angular/core';
import { FILE_TYPE_ICONS, FileType } from '../../../core/models/file-item';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileRow } from '../files-view';

type PreviewKind = 'image' | 'page' | 'text' | 'none';

const PREVIEW_KINDS: Partial<Record<FileType, PreviewKind>> = {
  image: 'image',
  pdf: 'page',
  doc: 'page',
  slides: 'page',
  code: 'text',
};
const PAGE_LINE_WIDTHS = [92, 86, 95, 70, 90, 82, 64, 88];
const BYTES_PER_PAGE = 400_000;

@Component({
  selector: 'app-file-preview-body',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './file-preview-body.component.html',
  styleUrl: './file-preview-body.component.scss',
})
export class FilePreviewBodyComponent {
  readonly file = input.required<FileRow>();
  readonly download = output<void>();

  protected readonly lineWidths = PAGE_LINE_WIDTHS;
  protected readonly kind = computed(() => PREVIEW_KINDS[this.file().type] ?? 'none');
  protected readonly icon = computed(() => FILE_TYPE_ICONS[this.file().type]);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.round(this.file().bytes / BYTES_PER_PAGE)),
  );
  protected readonly excerpt = computed(
    () =>
      `# ${this.file().name}\n\nShowing the first lines of this file.\nDownload it to see everything.`,
  );
}
