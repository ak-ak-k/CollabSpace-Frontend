import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AttachmentView, MessageView } from '../../../core/models/thread';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { ReactionPickerComponent } from '../reaction-bar/reaction-picker/reaction-picker.component';
import { DeliveryStatus, deliveryStatusOf } from './delivery-status';
import { MessageAttachmentsComponent } from './message-attachments/message-attachments.component';
import { MessageEditFormComponent } from './message-edit-form/message-edit-form.component';
import {
  MessageCommand,
  messageMenuItems,
  opensUpward,
  saveIconOf,
  saveLabelOf,
} from './message-menu';
import { MessageStatusComponent } from './message-status/message-status.component';
import { MessageTextComponent } from './message-text/message-text.component';
import { MessageToolbarComponent } from './message-toolbar/message-toolbar.component';

const AVATAR_SIZE = 40;
const FLAG_ICON_SIZE = 12;
const REPLY_ICON_SIZE = 14;
const MERIDIEM_SUFFIX = / [AP]M$/;
const INTERACTIVE_ANCESTORS = 'a, button, textarea, app-message-edit-form';

@Component({
  selector: 'app-message-bubble',
  imports: [
    NgTemplateOutlet,
    AvatarComponent,
    IconComponent,
    ReactionBarComponent,
    ReactionPickerComponent,
    MessageAttachmentsComponent,
    MessageEditFormComponent,
    MessageStatusComponent,
    MessageTextComponent,
    MessageToolbarComponent,
  ],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
  host: {
    role: 'article',
    tabindex: '0',
    '[attr.aria-label]': 'message().accessibleLabel',
    '[attr.data-message-id]': 'message().id',
    '[class.message--continuation]': 'message().continuation',
    '[class.message--editing]': 'editing()',
    '[class.message--pointer]': 'pointerActions()',
    '[class.message--touch]': '!pointerActions()',
    '[class.message--active]': 'pickerOpen() || menuOpen()',
    '[class.message--mention]': 'message().mentionsMe',
    '[class.message--flash]': 'flashing()',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onActivate($event)',
    '(keydown.space)': 'onActivate($event)',
    '(contextmenu)': 'onContextMenu($event)',
    '(mouseleave)': 'closePicker(false)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class MessageBubbleComponent {
  readonly message = input.required<MessageView>();
  readonly pointerActions = input(true, { transform: booleanAttribute });
  readonly editing = input(false, { transform: booleanAttribute });
  readonly canPin = input(true, { transform: booleanAttribute });
  readonly inThread = input(false, { transform: booleanAttribute });
  readonly flashing = input(false, { transform: booleanAttribute });
  readonly jumpOnTap = input(false, { transform: booleanAttribute });

  readonly command = output<MessageCommand>();
  readonly react = output<string>();
  readonly download = output<string>();
  readonly imageOpened = output<AttachmentView>();
  readonly reactorsShown = output<string>();
  readonly editSaved = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private pickerTrigger: HTMLElement | null = null;

  protected readonly pickerOpen = signal(false);
  protected readonly pickerExpanded = signal(false);
  protected readonly pickerUp = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly avatarSize = AVATAR_SIZE;
  protected readonly flagIconSize = FLAG_ICON_SIZE;
  protected readonly replyIconSize = REPLY_ICON_SIZE;

  protected readonly hasText = computed(() => this.message().text !== '');
  protected readonly hasReactions = computed(() => this.message().reactions.length > 0);
  protected readonly hasFlags = computed(() => this.message().pinned || this.message().saved);
  protected readonly failed = computed(() => this.message().deliveryState === 'failed');
  protected readonly showsToolbar = computed(() => this.pointerActions() && !this.editing());
  protected readonly sideTime = computed(() => this.message().time.replace(MERIDIEM_SUFFIX, ''));
  protected readonly saveLabel = computed(() => saveLabelOf(this.message()));
  protected readonly saveIcon = computed(() => saveIconOf(this.message()));
  protected readonly toolbarItems = computed(() =>
    messageMenuItems(this.message(), { canPin: this.canPin(), inThread: this.inThread() }).filter(
      (item) => !item.sheetOnly,
    ),
  );
  private readonly status = computed(() =>
    this.failed() ? null : deliveryStatusOf(this.message()),
  );
  protected readonly lineStatus = computed<DeliveryStatus | null>(() =>
    this.message().showsDeliveryLine ? this.status() : null,
  );
  protected readonly inlineStatus = computed<DeliveryStatus | null>(() =>
    this.message().showsDeliveryLine ? null : this.status(),
  );

  protected openPicker(trigger: HTMLElement): void {
    if (!this.pointerActions()) {
      this.command.emit('actions');
      return;
    }
    if (this.pickerOpen()) {
      this.closePicker(true);
      return;
    }
    this.pickerTrigger = trigger;
    this.pickerUp.set(opensUpward(trigger));
    this.pickerExpanded.set(false);
    this.pickerOpen.set(true);
  }

  protected closePicker(restoreFocus: boolean): void {
    if (!this.pickerOpen()) {
      return;
    }
    this.pickerOpen.set(false);
    if (restoreFocus) {
      this.pickerTrigger?.focus();
    }
    this.pickerTrigger = null;
  }

  protected pick(emoji: string): void {
    this.react.emit(emoji);
    this.closePicker(true);
  }

  protected onClick(event: MouseEvent): void {
    if (this.editing() || this.isInteractive(event.target)) {
      return;
    }
    if (this.jumpOnTap()) {
      this.command.emit('jump');
    } else if (!this.pointerActions()) {
      this.command.emit('actions');
    }
  }

  protected onActivate(event: Event): void {
    if (this.editing() || event.target !== this.host.nativeElement) {
      return;
    }
    if (this.jumpOnTap() || !this.pointerActions()) {
      event.preventDefault();
      this.command.emit(this.jumpOnTap() ? 'jump' : 'actions');
    }
  }

  protected onContextMenu(event: MouseEvent): void {
    if (this.pointerActions() || this.editing() || this.isInteractive(event.target)) {
      return;
    }
    event.preventDefault();
    this.command.emit('actions');
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) {
      return;
    }
    this.closePicker(false);
  }

  protected onEditSaved(text: string): void {
    this.focusHost();
    this.editSaved.emit(text);
  }

  protected onEditCancelled(): void {
    this.focusHost();
    this.command.emit('editCancel');
  }

  private focusHost(): void {
    this.host.nativeElement.focus({ preventScroll: true });
  }

  private isInteractive(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest(INTERACTIVE_ANCESTORS) !== null;
  }
}
