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
  WritableSignal,
} from '@angular/core';
import { Attachment } from '../../../core/models/message';
import { ComposerSubmission, MentionCandidate, ReplyPreview } from '../../../core/models/thread';
import { ButtonComponent } from '../../ui/button/button.component';
import { IconButtonComponent } from '../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { AttachmentChipsComponent } from './attachment-chips/attachment-chips.component';
import { ComposerFiles } from './composer-files';
import { FormatMark, SelectionEdit, wrapSelection } from './composer-format';
import { ComposerKeyCommand, composerKeyCommand } from './composer-keys';
import { ComposerMentionState } from './composer-mention.state';
import { CaretEdit, insertAtCaret, mentionTriggerFor, replaceMention } from './composer-text';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';
import { FormattingToolbarComponent } from './formatting-toolbar/formatting-toolbar.component';
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
    FormattingToolbarComponent,
    ReplyBannerComponent,
    AttachmentChipsComponent,
    TextareaAutoGrowDirective,
  ],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class MessageComposerComponent {
  readonly conversationTitle = input.required<string>();
  readonly label = input('');
  readonly placeholder = input('');
  readonly mentions = input<readonly MentionCandidate[]>([]);
  readonly replyTo = input<ReplyPreview | null>(null);
  readonly offline = input(false, { transform: booleanAttribute });
  readonly enterToSend = input(true, { transform: booleanAttribute });
  readonly layout = input<ComposerLayout>('desktop');
  readonly archivedWorkspace = input('');

  readonly draft = model('');
  readonly attachments = model<readonly Attachment[]>([]);

  readonly send = output<ComposerSubmission>();
  readonly cancelReply = output<void>();
  readonly editLastRequested = output<void>();

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly autoGrow = viewChild.required(TextareaAutoGrowDirective);
  private readonly files = new ComposerFiles();

  private readonly instanceId = `message-composer-${instanceCount++}`;
  protected readonly inputId = `${this.instanceId}-input`;
  protected readonly listId = `${this.instanceId}-mentions`;

  private readonly caret = signal(0);
  protected readonly emojiOpen = signal(false);
  protected readonly extrasOpen = signal(false);
  protected readonly formatOpen = signal(false);
  protected readonly mention = new ComposerMentionState(this.draft, this.caret, this.mentions);

  protected readonly isMobile = computed(() => this.layout() === 'mobile');
  protected readonly readOnly = computed(() => this.archivedWorkspace() !== '');
  protected readonly inputLabel = computed(
    () => this.label() || `Message ${this.conversationTitle()}`,
  );
  protected readonly placeholderText = computed(() => {
    if (this.readOnly()) {
      return `${this.archivedWorkspace()} is archived — read-only`;
    }
    return this.placeholder() || `Message ${this.conversationTitle()}`;
  });
  protected readonly canSend = computed(
    () => !this.readOnly() && (this.draft().trim() !== '' || this.attachments().length > 0),
  );
  protected readonly showsHelper = computed(() => !this.isMobile() || this.offline());
  protected readonly showsFormatting = computed(() => this.formatOpen() && !this.isMobile());
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
    const command = composerKeyCommand(event, {
      mentionOpen: this.mention.open(),
      draftEmpty: this.draft() === '',
      sendsOnEnter: !this.isMobile() && this.enterToSend(),
    });
    if (!command) {
      return;
    }
    if (command.kind !== 'escape') {
      event.preventDefault();
    }
    this.run(command);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  protected toggle(panel: WritableSignal<boolean>): void {
    panel.update((open) => !open);
  }

  protected closeEmoji(): void {
    this.emojiOpen.set(false);
    this.focus();
  }

  protected insertEmoji(emoji: string): void {
    this.emojiOpen.set(false);
    this.syncCaret();
    this.writeCaret(insertAtCaret(this.draft(), this.caret(), emoji));
  }

  protected startMention(): void {
    this.extrasOpen.set(false);
    this.syncCaret();
    const trigger = mentionTriggerFor(this.draft(), this.caret());
    this.writeCaret(insertAtCaret(this.draft(), this.caret(), trigger));
  }

  protected insertMention(candidate: MentionCandidate | undefined): void {
    const match = this.mention.match();
    if (candidate && match) {
      this.writeCaret(replaceMention(this.draft(), match, candidate.token));
    }
  }

  protected applyFormat(mark: FormatMark): void {
    const element = this.textarea().nativeElement;
    this.write(wrapSelection(this.draft(), element.selectionStart, element.selectionEnd, mark));
  }

  protected openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFilesChosen(): void {
    const chosen = this.files.takeFrom(this.fileInput().nativeElement);
    if (chosen.length > 0) {
      this.attachments.update((list) => [...list, ...chosen]);
    }
  }

  protected removeAttachment(index: number): void {
    this.files.release(this.attachments()[index]);
    this.attachments.update((list) => list.filter((_, position) => position !== index));
  }

  private run(command: ComposerKeyCommand): void {
    switch (command.kind) {
      case 'mention-move':
        return this.mention.move(command.step);
      case 'mention-pick':
        return this.insertMention(this.mention.active());
      case 'mention-dismiss':
        return this.mention.dismiss();
      case 'format':
        return this.applyFormat(command.mark);
      case 'send':
        return this.submit();
      case 'edit-last':
        return this.editLastRequested.emit();
      case 'escape':
        return this.handleEscape();
    }
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
    this.write({ text: '', start: 0, end: 0 }, !this.isMobile());
    this.attachments.set([]);
    this.emojiOpen.set(false);
    this.extrasOpen.set(false);
  }

  private writeCaret(edit: CaretEdit): void {
    this.write({ text: edit.text, start: edit.caret, end: edit.caret });
  }

  private write(edit: SelectionEdit, refocus = true): void {
    const element = this.textarea().nativeElement;
    element.value = edit.text;
    element.setSelectionRange(edit.start, edit.end);
    if (refocus) {
      element.focus();
    }
    this.draft.set(edit.text);
    this.caret.set(edit.end);
    this.mention.reset();
  }
}
