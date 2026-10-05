import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  model,
  output,
} from '@angular/core';
import { reactionLabel } from '../../../../core/models/emoji-names';
import { EMOJI_PALETTE, QUICK_EMOJI } from '../../../../core/models/thread';
import { IconName } from '../../../ui/icon/icon-registry';
import { IconComponent } from '../../../ui/icon/icon.component';
import { menuKeyTarget } from './menu-keys';

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

@Component({
  selector: 'app-reaction-picker',
  imports: [IconComponent],
  templateUrl: './reaction-picker.component.html',
  styleUrl: './reaction-picker.component.scss',
  host: {
    role: 'menu',
    'aria-label': 'Pick a reaction',
    '[class.reaction-picker--full]': 'expanded()',
    '(keydown)': 'onKeydown($event)',
    '(click)': '$event.stopPropagation()',
  },
})
export class ReactionPickerComponent {
  readonly expanded = model(false);
  readonly picked = output<string>();
  readonly closed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly emojis = computed(() => (this.expanded() ? EMOJI_PALETTE : QUICK_EMOJI));
  protected readonly toggleLabel = computed(() => (this.expanded() ? 'Fewer emoji' : 'More emoji'));
  protected readonly toggleIcon = computed<IconName>(() => (this.expanded() ? 'minus' : 'plus'));
  protected readonly labelOf = reactionLabel;

  constructor() {
    afterNextRender(() => this.items()[0]?.focus());
  }

  protected toggleExpanded(): void {
    this.expanded.update((expanded) => !expanded);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closed.emit();
      return;
    }
    const items = this.items();
    const current = items.findIndex((item) => item === event.target);
    const target = menuKeyTarget(event.key, current, items.length);
    if (target !== null) {
      event.preventDefault();
      items[target].focus();
    }
  }

  private items(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
  }
}
