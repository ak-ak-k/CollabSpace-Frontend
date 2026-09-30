import { Component, input, output } from '@angular/core';
import { ReplyPreview } from '../../../../core/models/thread';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../../ui/icon/icon.component';

@Component({
  selector: 'app-reply-banner',
  imports: [IconComponent, IconButtonComponent],
  templateUrl: './reply-banner.component.html',
  styleUrl: './reply-banner.component.scss',
})
export class ReplyBannerComponent {
  readonly reply = input.required<ReplyPreview>();
  readonly cancel = output<void>();
}
