import { computed, DestroyRef, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { MessageView, ReplyPreview } from '../../../core/models/thread';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ComposerDrafts } from './composer-drafts';

@Injectable()
export class ConversationSessionState {
  readonly searchOpen = signal(false);
  readonly query = signal('');
  readonly editingId = signal<string | null>(null);
  readonly replyTo = signal<MessageView | null>(null);
  readonly dockedDetailsOpen = signal(false);
  readonly drafts = new ComposerDrafts();
  private readonly workspace = inject(WorkspaceState);
  private readonly urls = inject(DOCUMENT).defaultView?.URL;

  readonly enterToSend = inject(PreferencesState).enterToSend;
  readonly archivedWorkspace = computed(() =>
    this.workspace.isArchived() ? (this.workspace.currentWorkspace()?.name ?? '') : '',
  );

  readonly searchTerm = computed(() => (this.searchOpen() ? this.query().trim() : ''));
  readonly searching = computed(() => this.searchTerm() !== '');
  readonly replyPreview = computed<ReplyPreview | null>(() => {
    const message = this.replyTo();
    return message ? { authorFirstName: message.authorFirstName, text: message.text } : null;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.releasePreviews());
  }

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

  private releasePreviews(): void {
    for (const attachment of this.drafts.pendingAttachments()) {
      if (attachment.src) {
        this.urls?.revokeObjectURL(attachment.src);
      }
    }
  }
}
