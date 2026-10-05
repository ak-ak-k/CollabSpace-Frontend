import { Component, inject } from '@angular/core';
import { FILE_TYPE_ICONS } from '../../../core/models/file-item';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { FileUploads, UploadItem } from '../file-uploads.service';

@Component({
  selector: 'app-files-upload-panel',
  imports: [ButtonComponent, IconButtonComponent, IconComponent],
  templateUrl: './files-upload-panel.component.html',
  styleUrl: './files-upload-panel.component.scss',
  host: { role: 'region', 'aria-label': 'Uploads' },
})
export class FilesUploadPanelComponent {
  protected readonly uploads = inject(FileUploads);

  protected iconOf(item: UploadItem): IconName {
    if (item.status === 'done') {
      return 'circle-check';
    }
    return item.status === 'failed' ? 'circle-alert' : FILE_TYPE_ICONS[item.type];
  }

  protected statusOf(item: UploadItem): string {
    if (item.status === 'done') {
      return 'Uploaded';
    }
    return item.status === 'failed' ? 'Upload failed' : `Uploading — ${item.progress}%`;
  }
}
