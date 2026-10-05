import { DOCUMENT, inject, Injectable } from '@angular/core';
import { conversationRoute, messageRoute, threadRoute } from '../../../core/models/conversation';
import { Message } from '../../../core/models/message';
import { AttachmentView } from '../../../core/models/thread';
import { DialogService } from '../../../core/services/dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChatMessagesState } from '../../../core/state/chat-messages.state';
import { ChatState } from '../../../core/state/chat.state';
import { FileState } from '../../../core/state/file.state';
import {
  ImageViewerComponent,
  ImageViewerData,
} from '../../../shared/components/image-viewer/image-viewer.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

@Injectable()
export class ConversationActions {
  private readonly chat = inject(ChatState);
  private readonly messages = inject(ChatMessagesState);
  private readonly files = inject(FileState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  async copyLink(conversationId: string): Promise<void> {
    const conversation = this.chat.conversation(conversationId);
    if (conversation) {
      await this.copyPath(conversationRoute(conversation));
    }
  }

  async copyMessageLink(conversationId: string, messageId: string): Promise<void> {
    const conversation = this.chat.conversation(conversationId);
    const message = this.find(conversationId, messageId);
    if (!conversation || !message) {
      return;
    }
    const rootId = message.threadRootId;
    await this.copyPath(
      rootId ? threadRoute(conversation, rootId) : messageRoute(conversation, messageId),
    );
  }

  async copyText(text: string): Promise<void> {
    await this.writeClipboard(text, 'Copied to clipboard', 'copy');
  }

  async togglePin(conversationId: string, messageId: string): Promise<void> {
    const pinned = await this.messages.togglePin(conversationId, messageId);
    this.toasts.show(pinned ? 'Message pinned' : 'Message unpinned', {
      icon: pinned ? 'pin' : 'pin-off',
    });
  }

  markUnreadFrom(conversationId: string, messageId: string): void {
    if (this.chat.markUnreadFrom(conversationId, messageId)) {
      this.toasts.show('Marked unread from here', { icon: 'circle-dot' });
    }
  }

  async retry(conversationId: string, messageId: string): Promise<void> {
    if (!(await this.messages.retry(conversationId, messageId))) {
      this.toasts.show('Still offline — try again when you reconnect', { icon: 'cloud-off' });
    }
  }

  async discard(conversationId: string, messageId: string): Promise<void> {
    const removed = await this.messages.remove(conversationId, messageId);
    if (removed) {
      this.toasts.show('Unsent message deleted', {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => void this.messages.restore(removed),
      });
    }
  }

  async remove(conversationId: string, messageId: string): Promise<boolean> {
    const confirmed = await this.dialogs.confirm({
      title: 'Delete message?',
      body: 'This removes the message for everyone in the conversation. You can undo right after.',
      confirmLabel: 'Delete',
      icon: 'trash-2',
    });
    if (!confirmed) {
      return false;
    }
    const removed = await this.messages.remove(conversationId, messageId);
    if (removed) {
      this.toasts.show('Message deleted', {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => void this.messages.restore(removed),
      });
    }
    return true;
  }

  async saveEdit(conversationId: string, messageId: string, text: string): Promise<void> {
    await this.messages.edit(conversationId, messageId, text);
    this.toasts.show('Message edited', { icon: 'pencil' });
  }

  react(conversationId: string, messageId: string, emoji: string): void {
    void this.messages.react(conversationId, messageId, emoji);
  }

  showReactors(description: string): void {
    this.toasts.show(description, { icon: 'smile' });
  }

  download(name: string): void {
    this.toasts.show(`Downloading ${name}`, { icon: 'download' });
  }

  openImage(attachment: AttachmentView): void {
    this.dialogs.open<void, ImageViewerData>(ImageViewerComponent, {
      data: { name: attachment.name, size: attachment.size, src: attachment.src },
      size: 'lg',
    });
  }

  registerAttachments(message: Message): void {
    for (const attachment of message.attachments) {
      void this.files.attachToMessage(message.conversationId, message.id, {
        name: attachment.name,
        sizeLabel: attachment.size,
        bytes: attachment.bytes ?? 0,
        type: attachment.type,
        previewUrl: attachment.src ?? null,
      });
    }
  }

  private find(conversationId: string, messageId: string): Message | null {
    const thread = this.chat.messages()[conversationId] ?? [];
    return thread.find((message) => message.id === messageId) ?? null;
  }

  private async copyPath(path: string): Promise<void> {
    await this.writeClipboard(`${this.document.location.origin}${path}`, 'Link copied', 'link');
  }

  private async writeClipboard(text: string, success: string, icon: IconName): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(text);
      this.toasts.show(success, { icon });
    } catch {
      this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
        icon: 'circle-alert',
      });
    }
  }
}
