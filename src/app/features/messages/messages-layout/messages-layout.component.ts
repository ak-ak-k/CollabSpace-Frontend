import { Component, computed, effect, inject, untracked } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ChatState } from '../../../core/state/chat.state';
import { CurrentRoute } from '../../../layout/current-route';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';

const CONVERSATION_PATH = /^\/messages\/([^/?#]+)/;

@Component({
  selector: 'app-messages-layout',
  imports: [RouterOutlet, ConversationListComponent, EmptyStateComponent],
  templateUrl: './messages-layout.component.html',
  styleUrl: './messages-layout.component.scss',
})
export class MessagesLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(CurrentRoute);
  private readonly chat = inject(ChatState);
  private readonly breakpoint = inject(BreakpointService);

  protected readonly conversationId = computed(
    () => CONVERSATION_PATH.exec(this.route.path())?.[1] ?? null,
  );
  protected readonly showList = computed(
    () => !this.breakpoint.isMobile() || this.conversationId() === null,
  );
  protected readonly showPane = computed(
    () => !this.breakpoint.isMobile() || this.conversationId() !== null,
  );

  constructor() {
    effect(() => {
      const first = this.chat.previews()[0];
      const shouldSelect =
        !this.breakpoint.isMobile() &&
        this.conversationId() === null &&
        this.chat.status() === 'ready';
      if (shouldSelect && first) {
        untracked(() => void this.router.navigate(['/messages', first.id], { replaceUrl: true }));
      }
    });
  }
}
