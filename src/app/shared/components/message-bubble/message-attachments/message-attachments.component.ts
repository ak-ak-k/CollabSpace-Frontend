import { Component, input, output } from '@angular/core';
import { AttachmentView } from '../../../../core/models/thread';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../../ui/icon/icon.component';

const IMAGE_ICON_SIZE = 28;
const FILE_ICON_SIZE = 18;
const DOWNLOAD_ICON_SIZE = 16;

@Component({
  selector: 'app-message-attachments',
  imports: [IconComponent, IconButtonComponent],
  templateUrl: './message-attachments.component.html',
  styleUrl: './message-attachments.component.scss',
})
export class MessageAttachmentsComponent {
  readonly attachments = input.required<readonly AttachmentView[]>();
  readonly download = output<string>();

  protected readonly imageIconSize = IMAGE_ICON_SIZE;
  protected readonly fileIconSize = FILE_ICON_SIZE;
  protected readonly downloadIconSize = DOWNLOAD_ICON_SIZE;
}
