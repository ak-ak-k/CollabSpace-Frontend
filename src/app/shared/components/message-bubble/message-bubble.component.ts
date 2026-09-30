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
import { IconName } from '../../ui/icon/icon-registry';
import { DELIVERY_ICONS, DELIVERY_LABELS, MessageView } from '../../../core/models/thread';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { MessageAttachmentsComponent } from './message-attachments/message-attachments.component';
import { MessageEditFormComponent } from './message-edit-form/message-edit-form.component';
import { MessageToolbarComponent } from './message-toolbar/message-toolbar.component';

interface DeliveryStatus {
  readonly icon: IconName;
  readonly label: string;
  readonly accessibleLabel: string;
  readonly read: boolean;
}

const AVATAR_SIZE = 40;
const PIN_ICON_SIZE = 12;
const REPLY_ICON_SIZE = 14;
const STATUS_ICON_SIZE = 14;
const MERIDIEM_SUFFIX = / [AP]M$/;
const QUEUED_ACCESSIBLE_LABEL = 'Queued';
const INTERACTIVE_ANCESTORS = 'a, button, textarea, app-message-edit-form';

@Component({
  selector: 'app-message-bubble',
  imports: [
    AvatarComponent,
    IconComponent,
    ReactionBarComponent,
    MessageAttachmentsComponent,
    MessageEditFormComponent,
    MessageToolbarComponent,
  ],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
  host: {
    role: 'article',
    tabindex: '0',
    '[attr.aria-label]': 'message().accessibleLabel',
    '[class.message--continuation]': 'message().continuation',
    '[class.message--editing]': 'editing()',
    '[class.message--pointer]': 'pointerActions()',
    '[class.message--touch]': '!pointerActions()',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onActivate($event)',
    '(keydown.space)': 'onActivate($event)',
    '(mouseleave)': 'pickerOpen.set(false)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class MessageBubbleComponent {
  readonly message = input.required<MessageView>();
  readonly pointerActions = input(true, { transform: booleanAttribute });
  readonly editing = input(false, { transform: booleanAttribute });

  readonly reply = output<void>();
  readonly copy = output<void>();
  readonly pin = output<void>();
  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();
  readonly react = output<string>();
  readonly download = output<string>();
  readonly actionsRequested = output<void>();
  readonly editSaved = output<string>();
  readonly editCancelled = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly pickerOpen = signal(false);
  protected readonly avatarSize = AVATAR_SIZE;
  protected readonly pinIconSize = PIN_ICON_SIZE;
  protected readonly replyIconSize = REPLY_ICON_SIZE;
  protected readonly statusIconSize = STATUS_ICON_SIZE;

  protected readonly hasText = computed(() => this.message().text !== '');
  protected readonly hasReactions = computed(() => this.message().reactions.length > 0);
  protected readonly showsHeading = computed(
    () => !this.message().continuation || this.message().pinned,
  );
  protected readonly showsToolbar = computed(() => this.pointerActions() && !this.editing());
  protected readonly sideTime = computed(() => this.message().time.replace(MERIDIEM_SUFFIX, ''));
  protected readonly status = computed<DeliveryStatus | null>(() => this.describeDelivery());
  protected readonly showsStatusLine = computed(
    () => this.status() !== null && this.message().showsDeliveryLine,
  );
  protected readonly showsInlineStatus = computed(
    () => this.status() !== null && this.hasText() && !this.message().showsDeliveryLine,
  );

  protected onAddReaction(): void {
    if (this.pointerActions()) {
      this.pickerOpen.set(true);
      return;
    }
    this.actionsRequested.emit();
  }

  protected onClick(event: MouseEvent): void {
    if (this.pointerActions() || this.editing() || this.isInteractive(event.target)) {
      return;
    }
    this.actionsRequested.emit();
  }

  protected onActivate(event: Event): void {
    if (this.pointerActions() || this.editing() || event.target !== this.host.nativeElement) {
      return;
    }
    event.preventDefault();
    this.actionsRequested.emit();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) {
      return;
    }
    this.pickerOpen.set(false);
  }

  protected onEditSaved(text: string): void {
    this.focusHost();
    this.editSaved.emit(text);
  }

  protected onEditCancelled(): void {
    this.focusHost();
    this.editCancelled.emit();
  }

  private focusHost(): void {
    this.host.nativeElement.focus({ preventScroll: true });
  }

  private isInteractive(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest(INTERACTIVE_ANCESTORS) !== null;
  }

  private describeDelivery(): DeliveryStatus | null {
    const message = this.message();
    if (!message.mine) {
      return null;
    }
    const state = message.deliveryState;
    const label = DELIVERY_LABELS[state];
    return {
      icon: DELIVERY_ICONS[state],
      label,
      accessibleLabel: state === 'queued' ? QUEUED_ACCESSIBLE_LABEL : label,
      read: state === 'read',
    };
  }
}
