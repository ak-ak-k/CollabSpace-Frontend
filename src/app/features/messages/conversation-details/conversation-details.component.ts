import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { ConversationExtras } from '../conversation/conversation-context';
import { ConversationView } from '../conversation/conversation-view';
import { CountPipe } from '../../../shared/pipes/count.pipe';

@Component({
  selector: 'app-conversation-details',
  imports: [
    CountPipe,
    AvatarComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    StatusDotComponent,
    TagComponent,
  ],
  templateUrl: './conversation-details.component.html',
  styleUrl: './conversation-details.component.scss',
  host: {
    '[class.details--docked]': 'docked()',
  },
})
export class ConversationDetailsComponent {
  readonly view = input.required<ConversationView>();
  readonly extras = input.required<ConversationExtras>();
  readonly docked = input(false, { transform: booleanAttribute });

  readonly closed = output<void>();
  readonly jump = output<string>();
  readonly addPeople = output<void>();

  protected readonly ids = {
    members: createUniqueId('details-members'),
    pinned: createUniqueId('details-pinned'),
    files: createUniqueId('details-files'),
  };
  protected readonly isDirect = computed(() => this.view().type === 'dm');
  protected readonly membersHeading = computed(() =>
    this.isDirect() ? 'In this conversation' : `Members · ${this.view().memberCount}`,
  );
  protected readonly mailto = computed(() => `mailto:${this.view().profile?.email ?? ''}`);
}
