import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LoadStatus } from '../../../../core/models/load-status';
import { ThreadRow } from '../../../../core/models/thread';
import { DateSeparatorComponent } from '../../../../shared/components/date-separator/date-separator.component';
import { MessageBubbleComponent } from '../../../../shared/components/message-bubble/message-bubble.component';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { ConversationView } from '../conversation-view';
import { MessageAction, SimpleMessageActionKind } from '../message-action';

const NEAR_BOTTOM_DISTANCE = 140;
const JUMP_TOP_OFFSET = 80;

@Component({
  selector: 'app-message-log',
  imports: [
    AvatarComponent,
    DateSeparatorComponent,
    EmptyStateComponent,
    IconComponent,
    MessageBubbleComponent,
    SkeletonComponent,
  ],
  templateUrl: './message-log.component.html',
  styleUrl: './message-log.component.scss',
})
export class MessageLogComponent {
  readonly view = input.required<ConversationView>();
  readonly rows = input<readonly ThreadRow[]>([]);
  readonly status = input<LoadStatus>('ready');
  readonly searching = input(false, { transform: booleanAttribute });
  readonly editingId = input<string | null>(null);
  readonly pointerActions = input(true, { transform: booleanAttribute });

  readonly action = output<MessageAction>();
  readonly retry = output<void>();

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');
  private nearBottom = true;
  private renderedMessageCount = 0;
  private renderedConversationId = '';

  protected readonly isReady = computed(
    () => this.status() === 'ready' || this.status() === 'empty',
  );
  protected readonly messageCount = computed(
    () => this.rows().filter((row) => row.kind === 'message').length,
  );
  protected readonly noResults = computed(() => this.searching() && this.messageCount() === 0);
  private readonly lastMessageIsMine = computed(() => {
    const last = this.rows().at(-1);
    return last?.kind === 'message' && last.message.mine;
  });

  constructor() {
    afterRenderEffect(() => {
      const count = this.messageCount();
      const conversationId = this.view().id;
      const switched = conversationId !== this.renderedConversationId;
      const grew = count > this.renderedMessageCount;
      if (switched || (grew && (this.nearBottom || this.lastMessageIsMine()))) {
        this.scrollToBottom();
      }
      this.renderedConversationId = conversationId;
      this.renderedMessageCount = count;
    });
  }

  scrollToBottom(): void {
    const element = this.log()?.nativeElement;
    if (element) {
      element.scrollTop = 0;
      this.nearBottom = true;
    }
  }

  jumpTo(messageId: string): void {
    const element = this.log()?.nativeElement;
    const row = element?.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (!element || !row) {
      return;
    }
    const offset = row.getBoundingClientRect().top - element.getBoundingClientRect().top;
    element.scrollTop += offset - JUMP_TOP_OFFSET;
    row.focus({ preventScroll: true });
  }

  protected trackScroll(element: HTMLElement): void {
    this.nearBottom = Math.abs(element.scrollTop) < NEAR_BOTTOM_DISTANCE;
  }

  protected emit(kind: SimpleMessageActionKind, messageId: string): void {
    this.action.emit({ kind, messageId });
  }

  protected emitReact(messageId: string, emoji: string): void {
    this.action.emit({ kind: 'react', messageId, emoji });
  }

  protected emitDownload(messageId: string, name: string): void {
    this.action.emit({ kind: 'download', messageId, name });
  }

  protected emitEditSave(messageId: string, text: string): void {
    this.action.emit({ kind: 'editSave', messageId, text });
  }
}
