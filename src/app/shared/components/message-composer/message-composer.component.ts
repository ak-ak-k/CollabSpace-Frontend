import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Attachment } from '../../../core/models/message';
import { ComposerSubmission, MentionCandidate, ReplyPreview } from '../../../core/models/thread';
import { ButtonComponent } from '../../ui/button/button.component';
import { IconButtonComponent } from '../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import {
  AttachmentChipsComponent,
  attachmentFromFile,
} from './attachment-chips/attachment-chips.component';
import { ComposerMentionState } from './composer-mention.state';
import { CaretEdit, insertAtCaret, mentionTriggerFor, replaceMention } from './composer-text';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';
import { MentionListComponent, mentionOptionId } from './mention-list/mention-list.component';
import { ReplyBannerComponent } from './reply-banner/reply-banner.component';
import { TextareaAutoGrowDirective } from './textarea-auto-grow.directive';

export type ComposerLayout = 'desktop' | 'mobile';

let instanceCount = 0;

@Component({
  selector: 'app-message-composer',
  imports: [
    IconComponent,
    IconButtonComponent,
    ButtonComponent,
    MentionListComponent,
    EmojiPickerComponent,
    ReplyBannerComponent,
    AttachmentChipsComponent,
    TextareaAutoGrowDirective,
  ],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class MessageComposerComponent {
  readonly conversationTitle = input.required<string>();
  readonly placeholder = input('');
  readonly members = input<readonly MentionCandidate[]>([]);
  readonly replyTo = input<ReplyPreview | null>(null);
  readonly offline = input(false, { transform: booleanAttribute });
  readonly enterToSend = input(true, { transform: booleanAttribute });
  readonly layout = input<ComposerLayout>('desktop');

  readonly draft = model('');
  readonly attachments = model<readonly Attachment[]>([]);

  readonly send = output<ComposerSubmission>();
  readonly cancelReply = output<void>();
  readonly editLastRequested = output<void>();

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly autoGrow = viewChild.required(TextareaAutoGrowDirective);

  private readonly instanceId = `message-composer-${instanceCount++}`;
  protected readonly inputId = `${this.instanceId}-input`;
  protected readonly listId = `${this.instanceId}-mentions`;

  private readonly caret = signal(0);
  protected readonly emojiOpen = signal(false);
  protected readonly extrasOpen = signal(false);
  protected readonly mention = new ComposerMentionState(this.draft, this.caret, this.members);

  protected readonly isMobile = computed(() => this.layout() === 'mobile');
  protected readonly placeholderText = computed(
    () => this.placeholder() || `Message ${this.conversationTitle()}`,
  );
  protected readonly canSend = computed(
    () => this.draft().trim() !== '' || this.attachments().length > 0,
  );
  protected readonly showsHelper = computed(() => !this.isMobile() || this.offline());
  protected readonly activeOptionId = computed(() =>
    mentionOptionId(this.listId, this.mention.activeIndex()),
  );

  constructor() {
    afterRenderEffect(() => {
      this.draft();
      this.autoGrow().fit();
    });
  }

  focus(): void {
    this.textarea().nativeElement.focus();
  }

  protected onInput(): void {
    this.draft.set(this.textarea().nativeElement.value);
    this.mention.reset();
    this.syncCaret();
  }

  protected syncCaret(): void {
    this.caret.set(this.textarea().nativeElement.selectionStart);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.mention.open() && this.handleMentionKey(event)) {
      return;
    }
    if (event.key === 'Enter') {
      this.handleEnter(event);
    } else if (event.key === 'ArrowUp' && this.draft() === '') {
      event.preventDefault();
      this.editLastRequested.emit();
    } else if (event.key === 'Escape') {
      this.handleEscape();
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  protected toggleExtras(): void {
    this.extrasOpen.update((open) => !open);
  }

  protected toggleEmoji(): void {
    this.emojiOpen.update((open) => !open);
  }

  protected closeEmoji(): void {
    this.emojiOpen.set(false);
    this.focus();
  }

  protected insertEmoji(emoji: string): void {
    this.emojiOpen.set(false);
    this.syncCaret();
    this.applyEdit(insertAtCaret(this.draft(), this.caret(), emoji));
  }

  protected startMention(): void {
    this.extrasOpen.set(false);
    this.syncCaret();
    const trigger = mentionTriggerFor(this.draft(), this.caret());
    this.applyEdit(insertAtCaret(this.draft(), this.caret(), trigger));
  }

  protected insertMention(candidate: MentionCandidate | undefined): void {
    const match = this.mention.match();
    if (candidate && match) {
      this.applyEdit(replaceMention(this.draft(), match, candidate.firstName));
    }
  }

  protected openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFilesChosen(): void {
    const input = this.fileInput().nativeElement;
    const chosen = Array.from(input.files ?? []).map(attachmentFromFile);
    if (chosen.length > 0) {
      this.attachments.update((list) => [...list, ...chosen]);
    }
    input.value = '';
  }

  protected removeAttachment(index: number): void {
    this.attachments.update((list) => list.filter((_, position) => position !== index));
  }

  private handleMentionKey(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'ArrowDown':
        this.mention.move(1);
        break;
      case 'ArrowUp':
        this.mention.move(-1);
        break;
      case 'Enter':
      case 'Tab':
        this.insertMention(this.mention.active());
        break;
      case 'Escape':
        this.mention.dismiss();
        break;
      default:
        return false;
    }
    event.preventDefault();
    return true;
  }

  private handleEnter(event: KeyboardEvent): void {
    if (event.isComposing || event.shiftKey) {
      return;
    }
    const forced = event.ctrlKey || event.metaKey;
    if (!forced && (this.isMobile() || !this.enterToSend())) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private handleEscape(): void {
    this.emojiOpen.set(false);
    if (this.replyTo()) {
      this.cancelReply.emit();
    }
  }

  private submit(): void {
    if (!this.canSend()) {
      return;
    }
    this.send.emit({ text: this.draft().trim(), attachments: this.attachments(), replyToId: null });
    this.applyEdit({ text: '', caret: 0 }, !this.isMobile());
    this.attachments.set([]);
    this.emojiOpen.set(false);
    this.extrasOpen.set(false);
  }

  private applyEdit(edit: CaretEdit, refocus = true): void {
    const element = this.textarea().nativeElement;
    element.value = edit.text;
    element.setSelectionRange(edit.caret, edit.caret);
    if (refocus) {
      element.focus();
    }
    this.draft.set(edit.text);
    this.caret.set(edit.caret);
    this.mention.reset();
  }
}
