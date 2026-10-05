import { computed, Signal, signal } from '@angular/core';
import { MentionCandidate } from '../../../core/models/thread';
import { suggestMentions } from '../../../core/state/chat-mentions';
import { findMentionMatch, MentionMatch } from './composer-text';

const PEOPLE_HEADING = 'People';
const CHANNELS_HEADING = 'Channels';

export class ComposerMentionState {
  private readonly dismissed = signal(false);
  private readonly requestedIndex = signal(0);

  readonly match: Signal<MentionMatch | null>;
  readonly candidates: Signal<readonly MentionCandidate[]>;
  readonly heading: Signal<string>;
  readonly open: Signal<boolean>;
  readonly activeIndex: Signal<number>;
  readonly active: Signal<MentionCandidate | undefined>;

  constructor(
    draft: Signal<string>,
    caret: Signal<number>,
    mentions: Signal<readonly MentionCandidate[]>,
  ) {
    this.match = computed(() => (this.dismissed() ? null : findMentionMatch(draft(), caret())));
    this.candidates = computed(() => {
      const match = this.match();
      return match ? suggestMentions(mentions(), match.trigger, match.query) : [];
    });
    this.heading = computed(() =>
      this.match()?.trigger === '#' ? CHANNELS_HEADING : PEOPLE_HEADING,
    );
    this.open = computed(() => this.candidates().length > 0);
    this.activeIndex = computed(() =>
      Math.min(this.requestedIndex(), Math.max(this.candidates().length - 1, 0)),
    );
    this.active = computed(() => this.candidates()[this.activeIndex()]);
  }

  move(step: number): void {
    const count = this.candidates().length;
    this.requestedIndex.set((this.activeIndex() + step + count) % count);
  }

  dismiss(): void {
    this.dismissed.set(true);
  }

  reset(): void {
    this.dismissed.set(false);
    this.requestedIndex.set(0);
  }
}
