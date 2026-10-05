import { MOCK_PREFERENCES } from '../mocks/settings.mock';
import {
  announcementOf,
  decideNotification,
  NotificationEvent,
  notificationFrom,
  NotificationRulesContext,
} from './notification-rules';

const message: NotificationEvent = {
  type: 'message',
  actorId: 'u2',
  conversationId: 'g-launch',
  text: 'posted in Launch crew',
  snippet: 'Changelog is ready',
  route: '/messages/g-launch',
};

const context: NotificationRulesContext = {
  currentUserId: 'u0',
  matrix: MOCK_PREFERENCES.notifications,
  notifyLevel: 'all',
  doNotDisturb: false,
  viewing: false,
};

describe('notification rules', () => {
  it('records and alerts a message in a conversation set to all', () => {
    expect(decideNotification(message, context)).toEqual({ record: true, alert: true });
  });

  it('stays silent for my own events and for the conversation I am reading', () => {
    expect(decideNotification({ ...message, actorId: 'u0' }, context).record).toBe(false);
    expect(decideNotification(message, { ...context, viewing: true }).record).toBe(false);
  });

  it('lets only mentions through when a conversation is set to mentions or muted', () => {
    const mention: NotificationEvent = { ...message, type: 'mention' };

    expect(decideNotification(message, { ...context, notifyLevel: 'mentions' }).record).toBe(false);
    expect(decideNotification(message, { ...context, notifyLevel: 'muted' }).record).toBe(false);
    expect(decideNotification(mention, { ...context, notifyLevel: 'mentions' }).record).toBe(true);
  });

  it('follows the in-app switch of the matching topic', () => {
    const matrix = { ...context.matrix, threads: { inapp: false, push: false, email: false } };
    const thread: NotificationEvent = { ...message, type: 'thread' };

    expect(decideNotification(thread, { ...context, matrix }).record).toBe(false);
    expect(decideNotification(message, { ...context, matrix }).record).toBe(true);
  });

  it('records without alerting while do not disturb is on', () => {
    expect(decideNotification(message, { ...context, doNotDisturb: true })).toEqual({
      record: true,
      alert: false,
    });
  });

  it('builds an unread notification in the category of the event and announces it', () => {
    const notification = notificationFrom(
      { ...message, type: 'thread', text: 'replied to a thread you’re in' },
      { id: 'n-x', workspaceId: 'w1', createdAt: 5 },
    );

    expect(notification).toEqual(
      expect.objectContaining({ id: 'n-x', category: 'message', read: false, actorId: 'u2' }),
    );
    expect(announcementOf(message, 'Priya Sharma')).toBe(
      'New notification: Priya Sharma posted in Launch crew',
    );
  });
});
