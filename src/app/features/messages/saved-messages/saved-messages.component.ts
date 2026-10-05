import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { InboxActions } from '../inbox-actions.service';
import { SavedRow, savedCountLabel, savedRowOf } from './saved-messages-view';

@Component({
  selector: 'app-saved-messages',
  imports: [
    RouterLink,
    AvatarComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
  ],
  templateUrl: './saved-messages.component.html',
  styleUrl: './saved-messages.component.scss',
})
export class SavedMessagesComponent {
  private readonly chat = inject(ChatState);
  private readonly workspace = inject(WorkspaceState);
  private readonly inbox = inject(InboxActions);

  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly status = computed(() =>
    this.workspace.status() === 'ready' ? this.chat.status() : this.workspace.status(),
  );
  protected readonly rows = computed<readonly SavedRow[]>(() =>
    this.chat.savedMessages().flatMap((saved) => {
      const conversation = this.chat.conversation(saved.message.conversationId);
      return conversation ? [savedRowOf(saved, conversation, this.workspace.usersById())] : [];
    }),
  );
  protected readonly countLabel = computed(() => savedCountLabel(this.rows().length));

  protected remove(row: SavedRow): void {
    this.inbox.toggleSave(row.id);
  }

  protected retry(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }
}
