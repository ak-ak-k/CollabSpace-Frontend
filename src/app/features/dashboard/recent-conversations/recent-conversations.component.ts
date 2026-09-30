import { Component, input, output } from '@angular/core';
import { ConversationPreview } from '../../../core/models/conversation';
import { LoadStatus } from '../../../core/models/load-status';
import { ConversationItemComponent } from '../../../shared/components/conversation-item/conversation-item.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-dashboard-recent-conversations',
  imports: [
    SectionHeaderComponent,
    ConversationItemComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './recent-conversations.component.html',
  styleUrl: './recent-conversations.component.scss',
  host: { role: 'region', 'aria-labelledby': 'dashboard-conversations' },
})
export class RecentConversationsComponent {
  readonly status = input.required<LoadStatus>();
  readonly conversations = input.required<readonly ConversationPreview[]>();

  readonly retry = output<void>();
  readonly startConversation = output<void>();
}
