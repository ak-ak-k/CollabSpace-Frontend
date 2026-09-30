import { computed, inject, Signal } from '@angular/core';
import { MentionCandidate, MessageView, ThreadRow } from '../../../core/models/thread';
import { ChatState } from '../../../core/state/chat.state';
import { buildThread } from '../../../core/state/thread-view';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ConversationView } from './conversation-view';

export interface ConversationThread {
  readonly rows: Signal<readonly ThreadRow[]>;
  readonly messages: Signal<readonly MessageView[]>;
  readonly mentionCandidates: Signal<readonly MentionCandidate[]>;
  readonly typingText: Signal<string>;
}

export const injectConversationThread = (
  conversationId: () => string,
  view: Signal<ConversationView | null>,
  searchTerm: () => string,
): ConversationThread => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  const rows = computed(() =>
    buildThread(chat.messages()[conversationId()] ?? [], {
      currentUserId: workspace.currentUser()?.id ?? '',
      usersById: workspace.usersById(),
      searchTerm: searchTerm(),
      newMarkerId: chat.newMessagesMarkerId(),
    }),
  );
  return {
    rows,
    messages: computed(() =>
      rows().flatMap((row) => (row.kind === 'message' ? [row.message] : [])),
    ),
    mentionCandidates: computed(() =>
      (view()?.members ?? [])
        .filter((member) => !member.isMe)
        .map(({ id, name, firstName, title, seed }) => ({ id, name, firstName, title, seed })),
    ),
    typingText: computed(() =>
      chat.status() === 'ready' ? (chat.preview(conversationId())?.typingText ?? '') : '',
    ),
  };
};
