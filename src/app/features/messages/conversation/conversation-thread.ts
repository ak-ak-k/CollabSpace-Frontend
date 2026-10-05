import { computed, inject, Signal } from '@angular/core';
import { MentionCandidate, MessageView, ThreadRow } from '../../../core/models/thread';
import { buildMentionCandidates } from '../../../core/state/chat-mentions';
import { ChatState } from '../../../core/state/chat.state';
import { FileState } from '../../../core/state/file.state';
import { PreferencesState } from '../../../core/state/preferences.state';
import { buildThread } from '../../../core/state/thread-view';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ConversationView } from './conversation-view';

export interface ConversationThread {
  readonly rows: Signal<readonly ThreadRow[]>;
  readonly messages: Signal<readonly MessageView[]>;
  readonly mentionCandidates: Signal<readonly MentionCandidate[]>;
  readonly typingText: Signal<string>;
}

const injectMentionCandidates = (
  view: Signal<ConversationView | null>,
): Signal<readonly MentionCandidate[]> => {
  const workspace = inject(WorkspaceState);
  const channels = computed(() => {
    const teamNames = new Map(workspace.teams().map((team) => [team.id, team.name]));
    return workspace.channels().map((channel) => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.isPrivate,
      teamName: teamNames.get(channel.teamId) ?? '',
    }));
  });
  return computed(() =>
    buildMentionCandidates({
      currentUserId: workspace.currentUser()?.id ?? '',
      members: view()?.members ?? [],
      workspaceMembers: workspace.members(),
      channels: channels(),
      direct: view()?.type === 'dm',
      allowEveryone: workspace.preferences()?.allowEveryone ?? true,
    }),
  );
};

export const injectConversationThread = (
  conversationId: () => string,
  view: Signal<ConversationView | null>,
  searchTerm: () => string,
  rootId: () => string | null = () => null,
): ConversationThread => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  const preferences = inject(PreferencesState);
  const files = inject(FileState);
  const savedIds = computed(() => new Set(Object.keys(chat.saved())));
  const fileIdFor = (name: string) => files.fileForAttachment(conversationId(), name)?.id ?? null;
  const rows = computed(() =>
    buildThread(chat.messages()[conversationId()] ?? [], {
      currentUserId: workspace.currentUser()?.id ?? '',
      usersById: workspace.usersById(),
      searchTerm: searchTerm(),
      newMarkerId: rootId() ? null : chat.newMessagesMarkerId(),
      rootId: rootId(),
      savedIds: savedIds(),
      threadUnreadCounts: chat.threadUnreadCounts(),
      fileIdFor,
    }),
  );
  return {
    rows,
    messages: computed(() =>
      rows().flatMap((row) => (row.kind === 'message' ? [row.message] : [])),
    ),
    mentionCandidates: injectMentionCandidates(view),
    typingText: computed(() => {
      const visible = chat.status() === 'ready' && preferences.preferences().typingIndicators;
      const root = rootId();
      if (!visible) {
        return '';
      }
      return root
        ? chat.threadTypingText(conversationId(), root)
        : (chat.preview(conversationId())?.typingText ?? '');
    }),
  };
};
