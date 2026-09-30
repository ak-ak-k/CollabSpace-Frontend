import {
  booleanAttribute,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { QUICK_EMOJI } from '../../../../core/models/thread';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../../ui/icon/icon.component';

const TOOL_ICON_SIZE = 16;

@Component({
  selector: 'app-message-toolbar',
  imports: [IconComponent, IconButtonComponent],
  templateUrl: './message-toolbar.component.html',
  styleUrl: './message-toolbar.component.scss',
})
export class MessageToolbarComponent {
  readonly hasText = input(false, { transform: booleanAttribute });
  readonly pinned = input(false, { transform: booleanAttribute });
  readonly mine = input(false, { transform: booleanAttribute });
  readonly pickerOpen = model(false);

  readonly reactionPicked = output<string>();
  readonly reply = output<void>();
  readonly copy = output<void>();
  readonly pin = output<void>();
  readonly edit = output<void>();
  readonly deleteRequested = output<void>();

  private readonly addButton = viewChild.required('addButton', { read: ElementRef });

  protected readonly quickEmoji = QUICK_EMOJI;
  protected readonly iconSize = TOOL_ICON_SIZE;

  protected togglePicker(): void {
    this.pickerOpen.update((open) => !open);
  }

  protected closePicker(): void {
    if (!this.pickerOpen()) {
      return;
    }
    this.pickerOpen.set(false);
    this.addButton().nativeElement.focus();
  }

  protected pick(emoji: string): void {
    this.reactionPicked.emit(emoji);
    this.closePicker();
  }
}
