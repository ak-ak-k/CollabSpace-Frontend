import { computed, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { threadRoute } from '../../../core/models/conversation';
import { MessageView } from '../../../core/models/thread';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import {
  MessageMenuContext,
  messageMenuItems,
} from '../../../shared/components/message-bubble/message-menu';
import { InboxActions } from '../inbox-actions.service';
import { ConversationActions } from './conversation-actions.service';
import { ConversationOverlays } from './conversation-overlays.service';
import { ConversationSessionState } from './conversation-session.state';
import { MessageAction } from './message-action';

export interface MessageHandlerOptions {
  readonly conversationId: () => string;
  readonly messages: Signal<readonly MessageView[]>;
  readonly focusComposer: () => void;
  readonly jumpTo: (messageId: string) => void;
  readonly rootId?: () => string | null;
}

export interface MessageHandler {
  readonly menuContext: Signal<MessageMenuContext>;
  readonly handle: (action: MessageAction) => void;
}

export const injectMessageHandler = (options: MessageHandlerOptions): MessageHandler => {
  const actions = inject(ConversationActions);
  const inbox = inject(InboxActions);
  const session = inject(ConversationSessionState);
  const overlays = inject(ConversationOverlays);
  const router = inject(Router);
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  const menuContext = computed<MessageMenuContext>(() => ({
    canPin: !workspace.access().isGuest,
    inThread: (options.rootId?.() ?? null) !== null,
  }));
  const find = (messageId: string) =>
    options.messages().find((message) => message.id === messageId) ?? null;
  const id = options.conversationId;

  const openThread = (rootId: string): void => {
    const conversation = chat.conversation(id());
    if (conversation) {
      void router.navigateByUrl(threadRoute(conversation, rootId));
    }
  };

  const quote = (messageId: string): void => {
    session.replyTo.set(find(messageId));
    options.focusComposer();
  };

  const remove = async (messageId: string): Promise<void> => {
    if (await actions.remove(id(), messageId)) {
      options.focusComposer();
    }
  };

  const discard = (messageId: string): void => {
    options.focusComposer();
    void actions.discard(id(), messageId);
  };

  const saveEdit = async (messageId: string, text: string): Promise<void> => {
    const original = find(messageId)?.text ?? '';
    const edited = text.trim();
    const changed = edited !== '' && edited !== original;
    if (changed && !actions.allowsEdit()) {
      return;
    }
    session.editingId.set(null);
    options.focusComposer();
    if (changed) {
      await actions.saveEdit(id(), messageId, edited);
    }
  };

  const openSheet = (messageId: string): void => {
    const message = find(messageId);
    if (!message || session.editingId() === messageId) {
      return;
    }
    overlays.openMessageActions(messageMenuItems(message, menuContext())).subscribe((result) => {
      if (result) {
        handle({ ...result, messageId });
      }
    });
  };

  const handle = (action: MessageAction): void => {
    const messageId = action.messageId;
    switch (action.kind) {
      case 'thread':
        return openThread(messageId);
      case 'save':
        return inbox.toggleSave(messageId);
      case 'copy':
        return void actions.copyText(find(messageId)?.text ?? '');
      case 'link':
        return void actions.copyMessageLink(id(), messageId);
      case 'quote':
        return quote(messageId);
      case 'pin':
        return void actions.togglePin(id(), messageId);
      case 'unread':
        return actions.markUnreadFrom(id(), messageId);
      case 'edit':
        return session.editingId.set(messageId);
      case 'delete':
        return void remove(messageId);
      case 'retry':
        return void actions.retry(id(), messageId);
      case 'discard':
        return discard(messageId);
      case 'actions':
        return openSheet(messageId);
      case 'jump':
        return options.jumpTo(messageId);
      case 'editCancel':
        return session.editingId.set(null);
      case 'react':
        return actions.react(id(), messageId, action.emoji);
      case 'download':
        return actions.download(action.name);
      case 'view':
        return actions.openImage(action.attachment);
      case 'reactors':
        return actions.showReactors(action.description);
      case 'editSave':
        return void saveEdit(messageId, action.text);
    }
  };

  return { menuContext, handle };
};
