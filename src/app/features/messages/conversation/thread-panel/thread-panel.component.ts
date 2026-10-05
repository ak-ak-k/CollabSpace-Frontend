import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadStatus } from '../../../../core/models/load-status';
import { ComposerSubmission, threadKey } from '../../../../core/models/thread';
import { ChatState } from '../../../../core/state/chat.state';
import { NetworkState } from '../../../../core/state/network.state';
import { MessageComposerComponent } from '../../../../shared/components/message-composer/message-composer.component';
import { TypingIndicatorComponent } from '../../../../shared/components/typing-indicator/typing-indicator.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ComposerDrafts } from '../composer-drafts';
import { JoinBarView } from '../conversation-access';
import { ConversationActions } from '../conversation-actions.service';
import { injectMessageSender, lastEditableId } from '../conversation-compose';
import { injectMessageHandler } from '../conversation-messages';
import { ConversationOverlays } from '../conversation-overlays.service';
import { ConversationSessionState } from '../conversation-session.state';
import { injectConversationThread } from '../conversation-thread';
import { ConversationView } from '../conversation-view';
import { JoinBarComponent } from '../join-bar/join-bar.component';
import { MessageLogComponent } from '../message-log/message-log.component';
import { ThreadPanelMode } from '../thread-layout';

@Component({
  selector: 'app-thread-panel',
  imports: [
    CdkTrapFocus,
    RouterLink,
    IconComponent,
    IconButtonComponent,
    EmptyStateComponent,
    MessageLogComponent,
    MessageComposerComponent,
    TypingIndicatorComponent,
    JoinBarComponent,
  ],
  providers: [ConversationActions, ConversationOverlays, ConversationSessionState],
  templateUrl: './thread-panel.component.html',
  styleUrl: './thread-panel.component.scss',
  host: {
    '[class.thread-panel--docked]': "mode() === 'docked'",
    '[class.thread-panel--overlay]': 'overlay()',
    '[class.thread-panel--fullscreen]': 'fullscreen()',
    '[attr.role]': "overlay() ? 'dialog' : 'region'",
    '[attr.aria-modal]': "overlay() ? 'true' : null",
    '[attr.aria-label]': "'Thread in ' + view().title",
  },
})
export class ThreadPanelComponent {
  private readonly chat = inject(ChatState);
  private readonly injector = inject(Injector);
  private readonly sendMessage = injectMessageSender();
  protected readonly network = inject(NetworkState);
  protected readonly session = inject(ConversationSessionState);

  readonly conversationId = input.required<string>();
  readonly rootId = input.required<string>();
  readonly view = input.required<ConversationView>();
  readonly drafts = input.required<ComposerDrafts>();
  readonly joinBar = input<JoinBarView | null>(null);
  readonly status = input<LoadStatus>('ready');
  readonly mode = input<ThreadPanelMode>('docked');

  readonly retry = output<void>();

  protected readonly thread = injectConversationThread(
    () => this.conversationId(),
    this.view,
    () => '',
    () => this.rootId(),
  );
  protected readonly messages = injectMessageHandler({
    conversationId: () => this.conversationId(),
    messages: this.thread.messages,
    focusComposer: () => this.composer()?.focus(),
    jumpTo: (messageId) => this.log()?.jumpTo(messageId),
    rootId: () => this.rootId(),
  });

  private readonly log = viewChild(MessageLogComponent);
  private readonly composer = viewChild(MessageComposerComponent);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  protected readonly overlay = computed(() => this.mode() === 'overlay');
  protected readonly fullscreen = computed(() => this.mode() === 'fullscreen');
  protected readonly draftKey = computed(() => threadKey(this.conversationId(), this.rootId()));
  protected readonly missing = computed(
    () => this.status() === 'ready' && this.thread.rows().length === 0,
  );
  protected readonly subtitle = computed(() => {
    const partner = this.view().partner;
    return partner ? `with ${partner.name}` : this.view().title;
  });

  constructor() {
    effect(() => {
      const rootId = this.rootId();
      untracked(() => {
        this.chat.openThread(rootId);
        this.session.reset();
        afterNextRender(() => this.focusOnOpen(), { injector: this.injector });
      });
    });
    inject(DestroyRef).onDestroy(() => this.chat.openThread(null));
  }

  protected async send(submission: ComposerSubmission): Promise<void> {
    this.drafts().clear(this.draftKey());
    await this.sendMessage(this.conversationId(), {
      ...submission,
      replyToId: null,
      threadRootId: this.rootId(),
    });
    if (!this.fullscreen()) {
      this.composer()?.focus();
    }
  }

  protected editLast(): void {
    const messageId = lastEditableId(this.thread.messages());
    if (messageId) {
      this.session.editingId.set(messageId);
    }
  }

  private focusOnOpen(): void {
    const composer = this.composer();
    if (composer && !this.fullscreen()) {
      composer.focus();
    } else {
      this.title()?.nativeElement.focus();
    }
  }
}
