import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { ConversationAccess } from '../conversation/conversation-access';
import { ConversationExtras } from '../conversation/conversation-context';
import { ConversationView } from '../conversation/conversation-view';
import { MembershipActions } from '../membership-actions.service';
import { DetailsIdentityComponent } from './details-identity/details-identity.component';
import { DetailsMembersComponent } from './details-members/details-members.component';
import { DetailsNotificationsComponent } from './details-notifications/details-notifications.component';

@Component({
  selector: 'app-conversation-details',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    DetailsIdentityComponent,
    DetailsMembersComponent,
    DetailsNotificationsComponent,
  ],
  templateUrl: './conversation-details.component.html',
  styleUrl: './conversation-details.component.scss',
  host: {
    '[class.details--docked]': 'docked()',
  },
})
export class ConversationDetailsComponent {
  private readonly membership = inject(MembershipActions);

  readonly view = input.required<ConversationView>();
  readonly extras = input.required<ConversationExtras>();
  readonly access = input.required<ConversationAccess>();
  readonly docked = input(false, { transform: booleanAttribute });

  readonly closed = output<void>();
  readonly jump = output<string>();

  protected readonly ids = {
    members: createUniqueId('details-members'),
    pinned: createUniqueId('details-pinned'),
    files: createUniqueId('details-files'),
  };
  protected readonly isDirect = computed(() => this.view().type === 'dm');
  protected readonly membersHeading = computed(() =>
    this.isDirect() ? 'In this conversation' : `Members · ${this.view().memberCount}`,
  );
  protected readonly filesQuery = computed(() => ({ conv: this.view().id }));

  protected addPeople(): void {
    void this.membership.addPeople(this.view().id);
  }
}
