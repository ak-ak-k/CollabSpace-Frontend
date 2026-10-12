import { computed, inject, Service } from '@angular/core';
import { ChatState } from './chat.state';
import { InviteState } from './invite.state';
import { countQueuedMessages, PendingWork, pendingWorkOf } from './pending-work';
import { TaskState } from './task.state';

@Service()
export class PendingWorkState {
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);
  private readonly invites = inject(InviteState);

  private readonly queuedMessages = computed(() => countQueuedMessages(this.chat.messages()));

  readonly pendingWork = computed<PendingWork>(() =>
    pendingWorkOf({
      messages: this.queuedMessages(),
      tasks: this.tasks.pendingCount(),
      invites: this.invites.queuedCount(),
    }),
  );

  readonly hasPendingWork = computed(() => this.pendingWork().total > 0);
}
