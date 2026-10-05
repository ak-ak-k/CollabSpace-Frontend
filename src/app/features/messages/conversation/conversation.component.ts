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
import { ComposerSubmission } from '../../../core/models/thread';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ChatState } from '../../../core/state/chat.state';
import { NetworkState } from '../../../core/state/network.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { MessageComposerComponent } from '../../../shared/components/message-composer/message-composer.component';
import { TypingIndicatorComponent } from '../../../shared/components/typing-indicator/typing-indicator.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConversationDetailsComponent } from '../conversation-details/conversation-details.component';
import { InboxActions } from '../inbox-actions.service';
import { MembershipActions } from '../membership-actions.service';
import { injectConversationAccess } from './conversation-access';
import { ConversationActions } from './conversation-actions.service';
import { injectMessageSender, lastEditableId } from './conversation-compose';
import {
  injectConversationExtras,
  injectConversationView,
  injectDirectConversationBootstrap,
} from './conversation-context';
import { ConversationHeaderComponent } from './conversation-header/conversation-header.component';
import { injectMessageHandler } from './conversation-messages';
import { ConversationOverlays } from './conversation-overlays.service';
import { ConversationSearchComponent } from './conversation-search/conversation-search.component';
import { ConversationSessionState } from './conversation-session.state';
import { injectConversationThread } from './conversation-thread';
import { JoinBarComponent } from './join-bar/join-bar.component';
import { MessageLogComponent } from './message-log/message-log.component';
import { injectThreadLayout } from './thread-layout';
import { ThreadPanelComponent } from './thread-panel/thread-panel.component';

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
    JoinBarComponent,
    TypingIndicatorComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ThreadPanelComponent,
  ],
  providers: [ConversationActions, ConversationOverlays, ConversationSessionState],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent {
  private readonly chat = inject(ChatState);
  private readonly workspace = inject(WorkspaceState);
  private readonly sendMessage = injectMessageSender();
  private readonly router = inject(Router);
  protected readonly actions = inject(ConversationActions);
  protected readonly inbox = inject(InboxActions);
  private readonly membership = inject(MembershipActions);
  private readonly overlays = inject(ConversationOverlays);
  private readonly breakpoint = inject(BreakpointService);
  protected readonly network = inject(NetworkState);
  protected readonly session = inject(ConversationSessionState);

  readonly conversationId = input.required<string>();
  readonly messageId = input(null, { transform: orDefault<string | null>(null) });
  readonly rootId = input(null, { transform: orDefault<string | null>(null) });
  readonly backLink = input(MESSAGES_ROUTE, { transform: orDefault(MESSAGES_ROUTE) });
  readonly backBelowDesktop = input(false, { transform: orDefault(false) });
  readonly detailsOnWideScreens = input(false, { transform: orDefault(false) });

  protected readonly view = injectConversationView(() => this.conversationId());
  protected readonly extras = injectConversationExtras(() => this.conversationId());
  protected readonly access = injectConversationAccess(this.view);
  protected readonly thread = injectConversationThread(
    () => this.conversationId(),
    this.view,
    () => this.session.searchTerm(),
  );
  protected readonly messages = injectMessageHandler({
    conversationId: () => this.conversationId(),
    messages: this.thread.messages,
    focusComposer: () => this.composer()?.focus(),
    jumpTo: (messageId) => this.jumpTo(messageId),
  });

  protected readonly creatingDirect = injectDirectConversationBootstrap(() =>
    this.conversationId(),
  );

  private readonly log = viewChild(MessageLogComponent);
  private readonly composer = viewChild(MessageComposerComponent);
  private linkedMessageKey = '';

  protected readonly threadMode = injectThreadLayout({
    conversationId: () => this.conversationId(),
    rootId: () => this.rootId(),
    restoreFocus: (rootId) => this.restoreFocusAfterThread(rootId),
  });

  protected readonly isMobile = this.breakpoint.isMobile;
  protected readonly status = computed(() =>
    this.workspace.status() === 'ready' ? this.chat.status() : this.workspace.status(),
  );
  protected readonly detailsDocked = computed(
    () => this.breakpoint.isDesktop() && this.session.dockedDetailsOpen() && !this.rootId(),
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
    effect(() => this.followMessageLink());
    inject(DestroyRef).onDestroy(() => this.chat.open(null));
  }

  protected openDetails(toggle: boolean): void {
    const threadOpen = this.rootId() !== null;
    if (threadOpen) {
      this.closeThread();
    }
    this.overlays.showDetails(this.conversationId(), toggle && !threadOpen, (messageId) =>
      this.jumpTo(messageId),
    );
  }

  protected closeThread(): void {
    const route = this.view()?.route;
    if (route) {
      void this.router.navigateByUrl(route);
    }
  }

  protected leave(): void {
    const id = this.conversationId();
    const channel = this.view()?.type === 'channel';
    void (channel ? this.membership.leaveChannel(id) : this.membership.leaveGroup(id));
  }

  protected jumpTo(messageId: string): void {
    this.session.closeSearch();
    this.log()?.jumpTo(messageId);
  }

  protected async send(submission: ComposerSubmission): Promise<void> {
    const conversationId = this.conversationId();
    const replyToId = this.session.replyTo()?.id ?? null;
    this.session.drafts.clear(conversationId);
    this.session.replyTo.set(null);
    await this.sendMessage(conversationId, { ...submission, replyToId, threadRootId: null });
    if (!this.isMobile()) {
      this.composer()?.focus();
    }
  }

  protected editLast(): void {
    const messageId = lastEditableId(this.thread.messages());
    if (messageId) {
      this.session.editingId.set(messageId);
    }
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }

  protected goBack(): void {
    void this.router.navigateByUrl(this.backLink());
  }

  private restoreFocusAfterThread(rootId: string): void {
    if (!this.log()?.focusThread(rootId)) {
      this.composer()?.focus();
    }
  }

  private followMessageLink(): void {
    const messageId = this.messageId();
    const log = this.log();
    if (!messageId || !log || this.status() !== 'ready') {
      return;
    }
    const key = `${this.conversationId()}/${messageId}`;
    if (key !== this.linkedMessageKey) {
      this.linkedMessageKey = key;
      untracked(() => log.jumpTo(messageId));
    }
  }
}
