import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { NotifyLevel } from '../models/conversation';
import { ChatState } from './chat.state';
import { dueRemindersFor } from './due-reminders';
import {
  announcementOf,
  decideNotification,
  NotificationDecision,
  NotificationEvent,
  notificationFrom,
} from './notification-rules';
import { NotificationState } from './notification.state';
import { PreferencesState } from './preferences.state';
import { TaskState } from './task.state';
import { WorkspaceState } from './workspace.state';

export interface Announcement {
  readonly id: number;
  readonly text: string;
}

export interface DeliveryOptions {
  readonly viewing: boolean;
}

const NOTIFICATION_ID_PREFIX = 'n-live-';

@Service()
export class NotificationEngine {
  private readonly notifications = inject(NotificationState);
  private readonly preferences = inject(PreferencesState);
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);

  private readonly remindedIds = new Set<string>();
  private created = 0;

  readonly announcement = signal<Announcement>({ id: 0, text: '' });
  readonly doNotDisturb = computed(
    () =>
      this.preferences.preferences().doNotDisturb || this.workspace.currentUser()?.status === 'dnd',
  );

  constructor() {
    effect(() => {
      const ready =
        this.notifications.loadStatus() === 'ready' && this.tasks.loadStatus() === 'ready';
      this.workspace.currentWorkspaceId();
      if (ready) {
        untracked(() => this.remindDueTasks());
      }
    });
  }

  deliver(event: NotificationEvent, options: DeliveryOptions): NotificationDecision {
    const decision = decideNotification(event, {
      currentUserId: CURRENT_USER_ID,
      matrix: this.preferences.preferences().notifications,
      notifyLevel: this.levelFor(event.conversationId),
      doNotDisturb: this.doNotDisturb(),
      viewing: options.viewing,
    });
    if (decision.record) {
      this.record(event);
    }
    if (decision.alert) {
      this.announce(event);
    }
    return decision;
  }

  private levelFor(conversationId: string | null): NotifyLevel {
    return conversationId ? this.chat.notifyLevel(conversationId) : 'all';
  }

  private record(event: NotificationEvent): void {
    const notification = notificationFrom(event, {
      id: `${NOTIFICATION_ID_PREFIX}${Date.now().toString(36)}-${++this.created}`,
      workspaceId: this.workspace.currentWorkspaceId(),
      createdAt: Date.now(),
    });
    void this.notifications.add([notification]);
  }

  private announce(event: NotificationEvent): void {
    const actorName = event.actorId ? (this.workspace.user(event.actorId)?.name ?? null) : null;
    this.announcement.update(({ id }) => ({
      id: id + 1,
      text: announcementOf(event, actorName),
    }));
  }

  private remindDueTasks(): void {
    if (!this.preferences.preferences().notifications.due.inapp) {
      return;
    }
    const reminders = dueRemindersFor(this.tasks.tasks(), {
      currentUserId: CURRENT_USER_ID,
      now: Date.now(),
      knownIds: new Set([
        ...this.remindedIds,
        ...this.notifications.notifications().map((notification) => notification.id),
      ]),
    });
    reminders.forEach((reminder) => this.remindedIds.add(reminder.id));
    void this.notifications.add(reminders);
  }
}
