import { Component, input, output } from '@angular/core';
import { FILE_TYPE_ICONS, fileTypeOf } from '../../../../core/models/file-item';
import { Attachment } from '../../../../core/models/message';
import { formatFileSize } from '../../../pipes/file-size.pipe';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconName } from '../../../ui/icon/icon-registry';
import { IconComponent } from '../../../ui/icon/icon.component';

const IMAGE_MIME_PREFIX = 'image/';

export type PreviewUrlFactory = (file: File) => string | null;

export const attachmentFromFile = (file: File, previewUrlOf: PreviewUrlFactory): Attachment => {
  const image = file.type.startsWith(IMAGE_MIME_PREFIX);
  const src = image ? previewUrlOf(file) : null;
  return {
    kind: image ? 'image' : 'file',
    type: fileTypeOf(file.name),
    name: file.name,
    size: formatFileSize(file.size),
    bytes: file.size,
    ...(src ? { src } : {}),
  };
};

@Component({
  selector: 'app-attachment-chips',
  imports: [IconComponent, IconButtonComponent],
  templateUrl: './attachment-chips.component.html',
  styleUrl: './attachment-chips.component.scss',
})
export class AttachmentChipsComponent {
  readonly attachments = input.required<readonly Attachment[]>();
  readonly remove = output<number>();

  protected iconFor(attachment: Attachment): IconName {
    return attachment.kind === 'image' ? 'image' : FILE_TYPE_ICONS[attachment.type];
  }
}
