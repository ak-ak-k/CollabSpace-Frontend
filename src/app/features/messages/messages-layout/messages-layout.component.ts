import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ChatState } from '../../../core/state/chat.state';
import { CurrentRoute } from '../../../layout/current-route';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';

const CONVERSATION_PATH = /^\/messages\/([^/?#]+)/;
const THREAD_PATH = /^\/messages\/[^/?#]+\/thread\//;
const ROOMY_DESKTOP_QUERY = '(min-width: 1440px)';
const SAVED_SEGMENT = 'saved';

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
  private readonly observer = inject(BreakpointObserver);
  private readonly roomy = toSignal(
    this.observer.observe(ROOMY_DESKTOP_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.observer.isMatched(ROOMY_DESKTOP_QUERY) },
  );

  private readonly segment = computed(() => CONVERSATION_PATH.exec(this.route.path())?.[1] ?? null);
  protected readonly savedOpen = computed(() => this.segment() === SAVED_SEGMENT);
  protected readonly conversationId = computed(() => (this.savedOpen() ? null : this.segment()));
  private readonly threadCrowdsList = computed(
    () => THREAD_PATH.test(this.route.path()) && this.breakpoint.isDesktop() && !this.roomy(),
  );
  protected readonly showList = computed(
    () => (!this.breakpoint.isMobile() || this.segment() === null) && !this.threadCrowdsList(),
  );
  protected readonly showPane = computed(
    () => !this.breakpoint.isMobile() || this.segment() !== null,
  );

  constructor() {
    effect(() => {
      const first = this.chat.previews().find((preview) => preview.type !== 'channel');
      const shouldSelect =
        !this.breakpoint.isMobile() && this.segment() === null && this.chat.status() === 'ready';
      if (shouldSelect && first) {
        untracked(() => void this.router.navigate(['/messages', first.id], { replaceUrl: true }));
      }
    });
  }
}
