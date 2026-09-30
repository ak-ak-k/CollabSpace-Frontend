import { computed, Signal, signal } from '@angular/core';
import { MentionCandidate } from '../../../core/models/thread';
import { filterMentionCandidates, findMentionMatch, MentionMatch } from './composer-text';

export class ComposerMentionState {
  private readonly dismissed = signal(false);
  private readonly requestedIndex = signal(0);

  readonly match: Signal<MentionMatch | null>;
  readonly candidates: Signal<readonly MentionCandidate[]>;
  readonly open: Signal<boolean>;
  readonly activeIndex: Signal<number>;
  readonly active: Signal<MentionCandidate | undefined>;

  constructor(
    draft: Signal<string>,
    caret: Signal<number>,
    members: Signal<readonly MentionCandidate[]>,
  ) {
    this.match = computed(() => (this.dismissed() ? null : findMentionMatch(draft(), caret())));
    this.candidates = computed(() => {
      const match = this.match();
      return match ? filterMentionCandidates(members(), match.query) : [];
    });
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
