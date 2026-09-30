import { afterNextRender, Component, ElementRef, inject, output } from '@angular/core';
import { EMOJI_PALETTE } from '../../../../core/models/thread';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
  host: {
    role: 'group',
    'aria-label': 'Insert emoji',
  },
})
export class EmojiPickerComponent {
  readonly pick = output<string>();

  protected readonly emojis = EMOJI_PALETTE;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.focusFirst());
  }

  focusFirst(): void {
    this.host.nativeElement.querySelector('button')?.focus();
  }
}
