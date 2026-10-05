import { DestroyRef, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { ChatData } from '../../core/data/chat.data';
import { CURRENT_USER_ID } from '../../core/mocks/users.mock';
import { Conversation, conversationRoute, threadRoute } from '../../core/models/conversation';
import { Message } from '../../core/models/message';
import { firstNameOf } from '../../core/models/user';
import { ToastService } from '../../core/services/toast.service';
import { mentionsUser } from '../../core/state/chat-format';
import { ChatState } from '../../core/state/chat.state';
import { NotificationEngine } from '../../core/state/notification-engine';
import { NotificationEvent } from '../../core/state/notification-rules';
import { WorkspaceState } from '../../core/state/workspace.state';
import { IconName } from '../../shared/ui/icon/icon-registry';

interface IncomingAlert {
  readonly event: NotificationEvent;
  readonly viewing: boolean;
  readonly toast: string;
  readonly icon: IconName;
}

const SOMEONE = 'Someone';

const messageTextOf = (mention: boolean, direct: boolean, title: string): string => {
  if (mention) {
    return direct ? 'mentioned you in a direct message' : `mentioned you in ${title}`;
  }
  return direct ? 'sent you a message' : `posted in ${title}`;
};

@Service({ autoProvided: false })
export class IncomingAlerts {
  private readonly chat = inject(ChatState);
  private readonly engine = inject(NotificationEngine);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  constructor() {
    const subscription = inject(ChatData).events$.subscribe((event) => {
      if (event.type === 'message') {
        this.receive(event.message);
      }
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  private receive(message: Message): void {
    const conversation = this.chat.conversation(message.conversationId);
    if (!conversation || !this.chat.inCurrentWorkspace(conversation.id)) {
      return;
    }
    const alert = message.threadRootId
      ? this.threadAlert(conversation, message, message.threadRootId)
      : this.messageAlert(conversation, message);
    if (alert && this.engine.deliver(alert.event, { viewing: alert.viewing }).alert) {
      this.toasts.show(alert.toast, {
        icon: alert.icon,
        actionLabel: 'Open',
        onAction: () => void this.router.navigateByUrl(alert.event.route ?? '/notifications'),
      });
    }
  }

  private messageAlert(conversation: Conversation, message: Message): IncomingAlert {
    const mention = this.mentionsMe(message);
    const text = messageTextOf(mention, conversation.type === 'dm', this.titleOf(conversation));
    return {
      event: this.eventFor(
        message,
        mention ? 'mention' : 'message',
        text,
        conversationRoute(conversation),
      ),
      viewing: this.chat.activeConversationId() === conversation.id,
      toast: `${this.authorFirstName(message)}: ${message.text}`,
      icon: 'message-square',
    };
  }

  private threadAlert(
    conversation: Conversation,
    message: Message,
    rootId: string,
  ): IncomingAlert | null {
    const mention = this.mentionsMe(message);
    if (!mention && !this.isInThread(conversation.id, rootId)) {
      return null;
    }
    const text = mention
      ? `mentioned you in a thread in ${this.titleOf(conversation)}`
      : 'replied to a thread you’re in';
    return {
      event: this.eventFor(
        message,
        mention ? 'mention' : 'thread',
        text,
        threadRoute(conversation, rootId),
      ),
      viewing: this.chat.activeThreadId() === rootId,
      toast: `${this.authorFirstName(message)} replied in a thread`,
      icon: 'messages-square',
    };
  }

  private eventFor(
    message: Message,
    type: NotificationEvent['type'],
    text: string,
    route: string,
  ): NotificationEvent {
    return {
      type,
      actorId: message.authorId,
      conversationId: message.conversationId,
      text,
      snippet: message.text,
      route,
    };
  }

  private isInThread(conversationId: string, rootId: string): boolean {
    const thread = (this.chat.messages()[conversationId] ?? []).filter(
      (candidate) => candidate.id === rootId || candidate.threadRootId === rootId,
    );
    return thread.some((candidate) => candidate.authorId === CURRENT_USER_ID);
  }

  private mentionsMe(message: Message): boolean {
    const me = this.workspace.currentUser();
    return mentionsUser(message.text, firstNameOf(me?.name ?? ''));
  }

  private titleOf(conversation: Conversation): string {
    return this.chat.preview(conversation.id)?.title ?? '';
  }

  private authorFirstName(message: Message): string {
    return firstNameOf(this.workspace.user(message.authorId)?.name ?? SOMEONE);
  }
}
