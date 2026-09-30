import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ComposerSubmission, MessageView } from '../../../core/models/thread';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChatMessagesState } from '../../../core/state/chat-messages.state';
import { ChatState } from '../../../core/state/chat.state';
import { NetworkState } from '../../../core/state/network.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { MessageComposerComponent } from '../../../shared/components/message-composer/message-composer.component';
import { TypingIndicatorComponent } from '../../../shared/components/typing-indicator/typing-indicator.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConversationDetailsComponent } from '../conversation-details/conversation-details.component';
import { ConversationActions } from './conversation-actions.service';
import {
  injectConversationExtras,
  injectConversationView,
  injectDirectConversationBootstrap,
} from './conversation-context';
import { ConversationHeaderComponent } from './conversation-header/conversation-header.component';
import { ConversationOverlays } from './conversation-overlays.service';
import { ConversationSearchComponent } from './conversation-search/conversation-search.component';
import { ConversationSessionState } from './conversation-session.state';
import { injectConversationThread } from './conversation-thread';
import { MessageAction } from './message-action';
import { MessageLogComponent } from './message-log/message-log.component';

const MESSAGES_ROUTE = '/messages';

const orDefault =
  <T>(fallback: T) =>
  (value: T | undefined): T =>
    value ?? fallback;

@Component({
  selector: 'app-conversation',
  imports: [
    ConversationHeaderComponent,
    ConversationSearchComponent,
    ConversationDetailsComponent,
    MessageLogComponent,
    MessageComposerComponent,
    TypingIndicatorComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  providers: [ConversationActions, ConversationOverlays, ConversationSessionState],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent {
  private readonly chat = inject(ChatState);
  private readonly chatMessages = inject(ChatMessagesState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly actions = inject(ConversationActions);
  private readonly overlays = inject(ConversationOverlays);
  private readonly breakpoint = inject(BreakpointService);
  protected readonly network = inject(NetworkState);
  protected readonly session = inject(ConversationSessionState);

  readonly conversationId = input.required<string>();
  readonly backLink = input(MESSAGES_ROUTE, { transform: orDefault(MESSAGES_ROUTE) });
  readonly backBelowDesktop = input(false, { transform: orDefault(false) });
  readonly detailsOnWideScreens = input(false, { transform: orDefault(false) });

  protected readonly view = injectConversationView(() => this.conversationId());
  protected readonly extras = injectConversationExtras(() => this.conversationId());
  protected readonly thread = injectConversationThread(
    () => this.conversationId(),
    this.view,
    () => this.session.searchTerm(),
  );

  protected readonly creatingDirect = injectDirectConversationBootstrap(() =>
    this.conversationId(),
  );

  private readonly log = viewChild(MessageLogComponent);
  private readonly composer = viewChild(MessageComposerComponent);

  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly status = computed(() =>
    this.workspace.status() === 'ready' ? this.chat.status() : this.workspace.status(),
  );
  protected readonly detailsDocked = computed(
    () => this.breakpoint.isDesktop() && this.session.dockedDetailsOpen(),
  );
  protected readonly backTarget = computed(() => {
    const visible = this.backBelowDesktop() ? !this.breakpoint.isDesktop() : this.isMobile();
    return visible ? this.backLink() : null;
  });
  protected readonly starred = computed(() => this.chat.starredIds().has(this.conversationId()));
  protected readonly muted = computed(() => this.chat.mutedIds().has(this.conversationId()));
  protected readonly placeholder = computed(() => {
    const view = this.view();
    return `Message ${view?.partner?.firstName ?? view?.title ?? ''}`;
  });

  constructor() {
    effect(() => {
      const conversationId = this.conversationId();
      untracked(() => {
        this.chat.open(conversationId);
        this.session.reset();
        if (this.detailsOnWideScreens()) {
          this.session.dockedDetailsOpen.set(this.breakpoint.isWideDesktop());
        }
      });
    });
    inject(DestroyRef).onDestroy(() => this.chat.open(null));
  }

  protected openDetails(toggle: boolean): void {
    if (!this.breakpoint.isDesktop()) {
      this.openDetailsDrawer();
    } else if (toggle) {
      this.session.toggleDockedDetails();
    } else {
      this.session.dockedDetailsOpen.set(true);
    }
  }

  protected addPeople(): void {
    const conversation = this.chat.conversation(this.conversationId());
    this.overlays.invite(conversation?.type === 'channel' ? conversation.teamId : undefined);
  }

  protected jumpTo(messageId: string): void {
    this.session.closeSearch();
    queueMicrotask(() => this.log()?.jumpTo(messageId));
  }

  protected handle(action: MessageAction): void {
    const conversationId = this.conversationId();
    switch (action.kind) {
      case 'reply':
        return this.startReply(action.messageId);
      case 'copy':
        return void this.actions.copyText(this.find(action.messageId)?.text ?? '');
      case 'pin':
        return void this.actions.togglePin(conversationId, action.messageId);
      case 'edit':
        return this.session.editingId.set(action.messageId);
      case 'delete':
        return void this.remove(action.messageId);
      case 'actions':
        return this.openMessageActions(action.messageId);
      case 'editCancel':
        return this.session.editingId.set(null);
      case 'react':
        return this.actions.react(conversationId, action.messageId, action.emoji);
      case 'download':
        return this.actions.download(action.name);
      case 'editSave':
        return void this.saveEdit(action.messageId, action.text);
    }
  }

  protected async send(submission: ComposerSubmission): Promise<void> {
    const conversationId = this.conversationId();
    const replyToId = this.session.replyTo()?.id ?? null;
    this.session.drafts.clear(conversationId);
    this.session.replyTo.set(null);
    const message = await this.chatMessages.send(conversationId, { ...submission, replyToId });
    if (message.deliveryState === 'queued') {
      this.toasts.show('Offline — message queued and will send on reconnect', {
        icon: 'cloud-off',
      });
    }
    if (!this.isMobile()) {
      this.composer()?.focus();
    }
  }

  protected editLast(): void {
    const own = this.thread.messages().filter((message) => message.mine && message.text !== '');
    const last = own.at(-1);
    if (last) {
      this.session.editingId.set(last.id);
    }
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }

  protected goBack(): void {
    void this.router.navigateByUrl(this.backLink());
  }

  private find(messageId: string): MessageView | null {
    return this.thread.messages().find((message) => message.id === messageId) ?? null;
  }

  private startReply(messageId: string): void {
    this.session.replyTo.set(this.find(messageId));
    this.composer()?.focus();
  }

  private async remove(messageId: string): Promise<void> {
    if (await this.actions.remove(this.conversationId(), messageId)) {
      this.composer()?.focus();
    }
  }

  private async saveEdit(messageId: string, text: string): Promise<void> {
    const original = this.find(messageId)?.text ?? '';
    const edited = text.trim();
    this.session.editingId.set(null);
    this.composer()?.focus();
    if (edited && edited !== original) {
      await this.actions.saveEdit(this.conversationId(), messageId, edited);
    }
  }

  private openDetailsDrawer(): void {
    this.overlays.openDetails(this.conversationId()).subscribe((result) => {
      if (result && 'jumpTo' in result) {
        this.jumpTo(result.jumpTo);
      } else if (result) {
        this.addPeople();
      }
    });
  }

  private openMessageActions(messageId: string): void {
    const message = this.find(messageId);
    if (!message || this.session.editingId() === messageId) {
      return;
    }
    this.overlays.openMessageActions(message).subscribe((result) => {
      if (result) {
        this.handle({ ...result, messageId });
      }
    });
  }
}
