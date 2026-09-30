import { computed, Injectable, signal } from '@angular/core';
import { MessageView, ReplyPreview } from '../../../core/models/thread';
import { ComposerDrafts } from './composer-drafts';

@Injectable()
export class ConversationSessionState {
  readonly searchOpen = signal(false);
  readonly query = signal('');
  readonly editingId = signal<string | null>(null);
  readonly replyTo = signal<MessageView | null>(null);
  readonly dockedDetailsOpen = signal(false);
  readonly drafts = new ComposerDrafts();

  readonly searchTerm = computed(() => (this.searchOpen() ? this.query().trim() : ''));
  readonly searching = computed(() => this.searchTerm() !== '');
  readonly replyPreview = computed<ReplyPreview | null>(() => {
    const message = this.replyTo();
    return message ? { authorFirstName: message.authorFirstName, text: message.text } : null;
  });

  toggleSearch(): void {
    this.query.set('');
    this.searchOpen.update((open) => !open);
  }

  closeSearch(): void {
    this.query.set('');
    this.searchOpen.set(false);
  }

  toggleDockedDetails(): void {
    this.dockedDetailsOpen.update((open) => !open);
  }

  reset(): void {
    this.closeSearch();
    this.editingId.set(null);
    this.replyTo.set(null);
  }
}
