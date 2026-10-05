import { IconName } from '../../shared/ui/icon/icon-registry';
import { NotifyLevel } from '../models/conversation';
import { AppNotification, NotificationCategory } from '../models/notification';
import { NotificationMatrix, NotificationTopic } from '../models/preferences';

export type NotificationEventType =
  'mention' | 'message' | 'thread' | 'task' | 'due' | 'team' | 'system';

export interface NotificationEvent {
  readonly type: NotificationEventType;
  readonly actorId: string | null;
  readonly conversationId: string | null;
  readonly text: string;
  readonly snippet: string;
  readonly route: string | null;
  readonly icon?: IconName;
}

export interface NotificationRulesContext {
  readonly currentUserId: string;
  readonly matrix: NotificationMatrix;
  readonly notifyLevel: NotifyLevel;
  readonly doNotDisturb: boolean;
  readonly viewing: boolean;
}

export interface NotificationDecision {
  readonly record: boolean;
  readonly alert: boolean;
}

export interface NotificationStamp {
  readonly id: string;
  readonly workspaceId: string;
  readonly createdAt: number;
}

const TOPIC_OF: Record<NotificationEventType, NotificationTopic> = {
  mention: 'mentions',
  message: 'dms',
  thread: 'threads',
  task: 'tasks',
  due: 'due',
  team: 'team',
  system: 'system',
};

const CATEGORY_OF: Record<NotificationEventType, NotificationCategory> = {
  mention: 'mention',
  message: 'message',
  thread: 'message',
  task: 'task',
  due: 'task',
  team: 'team',
  system: 'system',
};

const SILENT: NotificationDecision = { record: false, alert: false };

export const topicOf = (type: NotificationEventType): NotificationTopic => TOPIC_OF[type];

export const categoryOf = (type: NotificationEventType): NotificationCategory => CATEGORY_OF[type];

const passesConversationLevel = (event: NotificationEvent, level: NotifyLevel): boolean =>
  !event.conversationId || level === 'all' || event.type === 'mention';

export const decideNotification = (
  event: NotificationEvent,
  context: NotificationRulesContext,
): NotificationDecision => {
  const ownEvent = event.actorId !== null && event.actorId === context.currentUserId;
  if (ownEvent || context.viewing) {
    return SILENT;
  }
  if (!context.matrix[topicOf(event.type)].inapp) {
    return SILENT;
  }
  if (!passesConversationLevel(event, context.notifyLevel)) {
    return SILENT;
  }
  return { record: true, alert: !context.doNotDisturb };
};

export const notificationFrom = (
  event: NotificationEvent,
  stamp: NotificationStamp,
): AppNotification => ({
  ...stamp,
  category: categoryOf(event.type),
  actorId: event.actorId,
  text: event.text,
  snippet: event.snippet,
  read: false,
  route: event.route,
  ...(event.icon ? { icon: event.icon } : {}),
});

export const announcementOf = (event: NotificationEvent, actorName: string | null): string =>
  `New notification: ${actorName ? `${actorName} ` : ''}${event.text}`;
