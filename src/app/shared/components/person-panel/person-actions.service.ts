import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';

const MESSAGES_ROUTE = '/messages';
const OWN_PROFILE_ROUTE = '/profile';

export const profileRouteOf = (userId: string, isMe: boolean): string =>
  isMe ? OWN_PROFILE_ROUTE : `${OWN_PROFILE_ROUTE}/${userId}`;

@Service()
export class PersonActions {
  private readonly chat = inject(ChatState);
  private readonly router = inject(Router);
  private readonly clipboard = inject(Clipboard);
  private readonly toasts = inject(ToastService);

  async message(userId: string): Promise<void> {
    const conversationId = await this.chat.openDirectConversation(userId);
    await this.router.navigate([MESSAGES_ROUTE, conversationId]);
  }

  copyEmail(email: string): void {
    if (this.clipboard.copy(email)) {
      this.toasts.show(`Email copied — ${email}`, { icon: 'copy' });
      return;
    }
    this.toasts.show('Couldn’t copy — your browser blocked clipboard access', {
      icon: 'circle-alert',
    });
  }
}
