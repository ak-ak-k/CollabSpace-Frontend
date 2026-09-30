import { computed, effect, inject, Signal, untracked } from '@angular/core';
import { FILE_TYPE_ICONS } from '../../../core/models/file-item';
import { Message } from '../../../core/models/message';
import { firstNameOf, User } from '../../../core/models/user';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { formatWhen } from '../../../shared/pipes/time-format';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { buildConversationView, ConversationView } from './conversation-view';

export interface PinnedItem {
  readonly id: string;
  readonly authorFirstName: string;
  readonly when: string;
  readonly text: string;
}

export interface SharedFileItem {
  readonly key: string;
  readonly name: string;
  readonly icon: IconName;
  readonly meta: string;
}

export interface ConversationExtras {
  readonly pinned: readonly PinnedItem[];
  readonly files: readonly SharedFileItem[];
  readonly fileCount: number;
}

const VISIBLE_SHARED_FILES = 8;

const authorFirstName = (usersById: ReadonlyMap<string, User>, authorId: string): string =>
  firstNameOf(usersById.get(authorId)?.name ?? 'Someone');

const pinnedItems = (messages: readonly Message[], usersById: ReadonlyMap<string, User>) =>
  messages
    .filter((message) => message.pinned)
    .map<PinnedItem>((message) => ({
      id: message.id,
      authorFirstName: authorFirstName(usersById, message.authorId),
      when: formatWhen(message.sentAt),
      text: message.text || (message.attachments[0]?.name ?? ''),
    }));

const sharedFiles = (messages: readonly Message[], usersById: ReadonlyMap<string, User>) =>
  messages
    .flatMap((message) =>
      message.attachments.map<SharedFileItem>((attachment, index) => ({
        key: `${message.id}-${index}`,
        name: attachment.name,
        icon: FILE_TYPE_ICONS[attachment.type] ?? 'file',
        meta: `${attachment.size} · ${authorFirstName(usersById, message.authorId)} · ${formatWhen(message.sentAt)}`,
      })),
    )
    .reverse();

export const injectConversationView = (
  conversationId: () => string | null,
): Signal<ConversationView | null> => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  return computed(() => {
    const id = conversationId();
    const conversation = id ? chat.conversations().find((candidate) => candidate.id === id) : null;
    if (!conversation) {
      return null;
    }
    const channel =
      conversation.type === 'channel'
        ? (workspace.channels().find((candidate) => candidate.id === conversation.channelId) ??
          null)
        : null;
    return buildConversationView(conversation, {
      usersById: workspace.usersById(),
      currentUserId: workspace.currentUser()?.id ?? '',
      channel,
      team: channel ? workspace.team(channel.teamId) : null,
    });
  });
};

export const injectConversationExtras = (
  conversationId: () => string | null,
): Signal<ConversationExtras> => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  return computed(() => {
    const id = conversationId();
    const messages = id ? (chat.messages()[id] ?? []) : [];
    const files = sharedFiles(messages, workspace.usersById());
    return {
      pinned: pinnedItems(messages, workspace.usersById()),
      files: files.slice(0, VISIBLE_SHARED_FILES),
      fileCount: files.length,
    };
  });
};

const DIRECT_CONVERSATION_PATTERN = /^dm-(.+)$/;

export const injectDirectConversationBootstrap = (
  conversationId: () => string,
): Signal<boolean> => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  const partnerId = computed(() => {
    const userId = DIRECT_CONVERSATION_PATTERN.exec(conversationId())?.[1] ?? null;
    return userId && workspace.user(userId) ? userId : null;
  });
  const pending = computed(
    () => partnerId() !== null && chat.conversation(conversationId()) === null,
  );
  effect(() => {
    const userId = partnerId();
    if (userId && pending() && chat.status() === 'ready') {
      untracked(() => void chat.openDirectConversation(userId));
    }
  });
  return pending;
};
