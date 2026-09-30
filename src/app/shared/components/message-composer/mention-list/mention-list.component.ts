import { Component, input, output } from '@angular/core';
import { MentionCandidate } from '../../../../core/models/thread';
import { AvatarComponent } from '../../../ui/avatar/avatar.component';

export const mentionOptionId = (listId: string, index: number): string =>
  `${listId}-option-${index}`;

@Component({
  selector: 'app-mention-list',
  imports: [AvatarComponent],
  templateUrl: './mention-list.component.html',
  styleUrl: './mention-list.component.scss',
  host: {
    role: 'listbox',
    'aria-label': 'Mention someone',
    '[attr.id]': 'listId()',
  },
})
export class MentionListComponent {
  readonly listId = input.required<string>();
  readonly candidates = input.required<readonly MentionCandidate[]>();
  readonly activeIndex = input(0);
  readonly pick = output<MentionCandidate>();

  protected optionId(index: number): string {
    return mentionOptionId(this.listId(), index);
  }
}
