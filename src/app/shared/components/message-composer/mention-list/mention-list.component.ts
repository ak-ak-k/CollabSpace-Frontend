import { Component, computed, input, output } from '@angular/core';
import { MentionCandidate } from '../../../../core/models/thread';
import { AvatarComponent } from '../../../ui/avatar/avatar.component';

export const mentionOptionId = (listId: string, index: number): string =>
  `${listId}-option-${index}`;

const PEOPLE_HEADING = 'People';
const CHANNELS_HEADING = 'Channels';

@Component({
  selector: 'app-mention-list',
  imports: [AvatarComponent],
  templateUrl: './mention-list.component.html',
  styleUrl: './mention-list.component.scss',
  host: {
    role: 'listbox',
    '[attr.aria-label]': 'listLabel()',
    '[attr.id]': 'listId()',
  },
})
export class MentionListComponent {
  readonly listId = input.required<string>();
  readonly candidates = input.required<readonly MentionCandidate[]>();
  readonly activeIndex = input(0);
  readonly heading = input(PEOPLE_HEADING);
  readonly pick = output<MentionCandidate>();

  protected readonly listLabel = computed(() =>
    this.heading() === CHANNELS_HEADING ? 'Mention a channel' : 'Mention someone',
  );

  protected optionId(index: number): string {
    return mentionOptionId(this.listId(), index);
  }

  protected tileOf(candidate: MentionCandidate): string {
    return candidate.kind === 'channel' ? '#' : '@';
  }
}
