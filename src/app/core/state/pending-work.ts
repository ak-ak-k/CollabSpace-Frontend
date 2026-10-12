import { Message } from '../models/message';
import { Threads } from './chat-mutations';

export interface PendingWork {
  readonly messages: number;
  readonly tasks: number;
  readonly invites: number;
  readonly total: number;
}

export interface PendingWorkCounts {
  readonly messages: number;
  readonly tasks: number;
  readonly invites: number;
}

export const NO_PENDING_WORK: PendingWork = { messages: 0, tasks: 0, invites: 0, total: 0 };

export const isWaitingToSync = (message: Message): boolean =>
  message.deliveryState === 'queued' ||
  (message.deliveryState === 'failed' && !!message.syncFailed);

export const countQueuedMessages = (threads: Threads): number =>
  Object.values(threads).reduce(
    (count, thread) => count + thread.filter(isWaitingToSync).length,
    0,
  );

export const pendingWorkOf = (counts: PendingWorkCounts): PendingWork => ({
  ...counts,
  total: counts.messages + counts.tasks + counts.invites,
});
