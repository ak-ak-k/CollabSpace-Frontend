import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileSourceInfo } from '../../../core/models/file-source';
import { formatDate, formatRelative } from '../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { FileRow } from '../files-view';

interface FileDetail {
  readonly term: string;
  readonly value: string;
}

const UPLOADED_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

@Component({
  selector: 'app-file-preview-details',
  imports: [ButtonComponent, IconComponent, RouterLink],
  templateUrl: './file-preview-details.component.html',
  styleUrl: './file-preview-details.component.scss',
  host: { role: 'complementary', 'aria-label': 'File details' },
})
export class FilePreviewDetailsComponent {
  readonly file = input.required<FileRow>();
  readonly references = input.required<readonly FileSourceInfo[]>();
  readonly rename = output<void>();
  readonly copyLink = output<void>();
  readonly remove = output<void>();

  protected readonly sharedHeadingId = createOverlayId('file-shared-in');
  protected readonly details = computed<readonly FileDetail[]>(() => {
    const file = this.file();
    return [
      {
        term: 'Type',
        value: file.extension ? `${file.typeLabel} (.${file.extension})` : file.typeLabel,
      },
      { term: 'Size', value: file.sizeLabel },
      { term: 'Uploaded by', value: file.ownerName },
      { term: 'Uploaded', value: formatDate(file.uploadedAt, UPLOADED_DATE_FORMAT) },
      { term: 'Modified', value: formatRelative(file.modifiedAt) },
      { term: 'Source', value: file.source.label },
      ...(file.teamName ? [{ term: 'Team', value: file.teamName }] : []),
    ];
  });
}
