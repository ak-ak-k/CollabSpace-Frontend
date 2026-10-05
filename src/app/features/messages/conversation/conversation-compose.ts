import { inject } from '@angular/core';
import { MessageDraft } from '../../../core/models/message';
import { MessageView } from '../../../core/models/thread';
import { ToastService } from '../../../core/services/toast.service';
import { ChatMessagesState } from '../../../core/state/chat-messages.state';
import { ConversationActions } from './conversation-actions.service';

export type MessageSender = (conversationId: string, draft: MessageDraft) => Promise<void>;

export const injectMessageSender = (): MessageSender => {
  const chatMessages = inject(ChatMessagesState);
  const actions = inject(ConversationActions);
  const toasts = inject(ToastService);
  return async (conversationId, draft) => {
    const message = await chatMessages.send(conversationId, draft);
    actions.registerAttachments(message);
    if (message.deliveryState === 'queued') {
      toasts.show('Offline — message queued and will send on reconnect', { icon: 'cloud-off' });
    }
  };
};

export const lastEditableId = (messages: readonly MessageView[]): string | null =>
  messages
    .filter((message) => message.mine && message.text !== '' && message.deliveryState !== 'failed')
    .at(-1)?.id ?? null;
