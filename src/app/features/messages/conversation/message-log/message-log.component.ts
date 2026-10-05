import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { threadPath } from '../../../../core/models/conversation';
import { LoadStatus } from '../../../../core/models/load-status';
import { AttachmentView, ThreadRow } from '../../../../core/models/thread';
import { DateSeparatorComponent } from '../../../../shared/components/date-separator/date-separator.component';
import { MessageBubbleComponent } from '../../../../shared/components/message-bubble/message-bubble.component';
import { MessageCommand } from '../../../../shared/components/message-bubble/message-menu';
import { ThreadRowComponent } from '../../../../shared/components/thread-row/thread-row.component';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { ConversationView } from '../conversation-view';
import { MessageAction } from '../message-action';

const NEAR_BOTTOM_DISTANCE = 140;
const JUMP_TOP_OFFSET = 80;
const FLASH_DURATION = 1800;

@Component({
  selector: 'app-message-log',
  imports: [
    AvatarComponent,
    DateSeparatorComponent,
    EmptyStateComponent,
    IconComponent,
    MessageBubbleComponent,
    SkeletonComponent,
    ThreadRowComponent,
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
  readonly canPin = input(true, { transform: booleanAttribute });
  readonly rootId = input<string | null>(null);
  readonly label = input('Messages');

  readonly action = output<MessageAction>();
  readonly retry = output<void>();

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');
  private readonly pendingJump = signal<string | null>(null);
  private nearBottom = true;
  private renderedMessageCount = 0;
  private renderedKey = '';
  private flashTimer?: ReturnType<typeof setTimeout>;

  protected readonly flashId = signal<string | null>(null);
  protected readonly inThread = computed(() => this.rootId() !== null);
  private readonly scrollKey = computed(() => `${this.view().id}:${this.rootId() ?? ''}`);
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
      this.followLatest(this.messageCount(), this.scrollKey());
      const target = this.pendingJump();
      if (target && this.scrollToMessage(target)) {
        this.pendingJump.set(null);
        this.flash(target);
      }
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.flashTimer));
  }

  scrollToBottom(): void {
    const element = this.log()?.nativeElement;
    if (element) {
      element.scrollTop = 0;
      this.nearBottom = true;
    }
  }

  jumpTo(messageId: string): void {
    this.pendingJump.set(messageId);
  }

  focusThread(messageId: string): boolean {
    const row = this.messageElement(messageId);
    const target = row?.querySelector<HTMLElement>('app-thread-row a') ?? row;
    target?.focus();
    return target !== null;
  }

  protected threadLink(messageId: string): string {
    return threadPath(this.view().route, messageId);
  }

  protected trackScroll(element: HTMLElement): void {
    this.nearBottom = Math.abs(element.scrollTop) < NEAR_BOTTOM_DISTANCE;
  }

  protected emit(kind: MessageCommand, messageId: string): void {
    this.action.emit({ kind, messageId });
  }

  protected emitReact(messageId: string, emoji: string): void {
    this.action.emit({ kind: 'react', messageId, emoji });
  }

  protected emitDownload(messageId: string, name: string): void {
    this.action.emit({ kind: 'download', messageId, name });
  }

  protected emitView(messageId: string, attachment: AttachmentView): void {
    this.action.emit({ kind: 'view', messageId, attachment });
  }

  protected emitReactors(messageId: string, description: string): void {
    this.action.emit({ kind: 'reactors', messageId, description });
  }

  protected emitEditSave(messageId: string, text: string): void {
    this.action.emit({ kind: 'editSave', messageId, text });
  }

  private followLatest(count: number, key: string): void {
    const switched = key !== this.renderedKey;
    const grew = count > this.renderedMessageCount;
    if (switched || (grew && (this.nearBottom || this.lastMessageIsMine()))) {
      this.scrollToBottom();
    }
    this.renderedKey = key;
    this.renderedMessageCount = count;
  }

  private messageElement(messageId: string): HTMLElement | null {
    const rows = this.log()?.nativeElement.querySelectorAll<HTMLElement>('[data-message-id]') ?? [];
    return Array.from(rows).find((row) => row.dataset['messageId'] === messageId) ?? null;
  }

  private scrollToMessage(messageId: string): boolean {
    const element = this.log()?.nativeElement;
    const row = this.messageElement(messageId);
    if (!element || !row) {
      return false;
    }
    const offset = row.getBoundingClientRect().top - element.getBoundingClientRect().top;
    element.scrollTop += offset - JUMP_TOP_OFFSET;
    row.focus({ preventScroll: true });
    return true;
  }

  private flash(messageId: string): void {
    this.flashId.set(messageId);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.flashId.set(null), FLASH_DURATION);
  }
}
