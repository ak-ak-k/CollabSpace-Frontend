import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { NOTIFY_LEVELS, NotifyLevel } from '../../../../core/models/conversation';
import { ChatState } from '../../../../core/state/chat.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import {
  RadioGroupComponent,
  RadioOption,
} from '../../../../shared/ui/radio/radio-group.component';
import { InboxActions } from '../../inbox-actions.service';
import { MembershipActions } from '../../membership-actions.service';

const NOTIFY_OPTIONS: readonly RadioOption[] = [
  { value: 'all', label: 'All' },
  { value: 'mentions', label: 'Mentions' },
  { value: 'muted', label: 'Muted' },
];

const isNotifyLevel = (value: string): value is NotifyLevel =>
  NOTIFY_LEVELS.some((level) => level === value);

@Component({
  selector: 'app-details-notifications',
  imports: [ButtonComponent, IconComponent, RadioGroupComponent],
  templateUrl: './details-notifications.component.html',
  styleUrl: './details-notifications.component.scss',
})
export class DetailsNotificationsComponent {
  private readonly chat = inject(ChatState);
  private readonly inbox = inject(InboxActions);
  protected readonly membership = inject(MembershipActions);

  readonly conversationId = input.required<string>();
  readonly canEditChannel = input(false, { transform: booleanAttribute });
  readonly canArchiveChannel = input(false, { transform: booleanAttribute });

  protected readonly options = NOTIFY_OPTIONS;
  protected readonly level = computed(() => this.chat.notifyLevel(this.conversationId()));

  protected choose(value: string): void {
    if (isNotifyLevel(value) && value !== this.level()) {
      this.inbox.setNotifyLevel(this.conversationId(), value);
    }
  }
}
