import { ConnectionPhase } from '../../core/state/connection-sync';
import { PendingWork } from '../../core/state/pending-work';
import { formatCount } from '../../shared/pipes/count.pipe';
import { IconName } from '../../shared/ui/icon/icon-registry';

export type NetworkBarTone = 'ink' | 'danger';

export type NetworkBarCommand = 'retry-connection' | 'retry-sync';

export interface NetworkBarAction {
  readonly label: string;
  readonly command: NetworkBarCommand;
}

export interface NetworkBarView {
  readonly phase: ConnectionPhase;
  readonly role: 'status' | 'alert';
  readonly tone: NetworkBarTone;
  readonly busy: boolean;
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
  readonly showDetails: boolean;
  readonly action: NetworkBarAction | null;
}

const QUEUES_NOTE =
  'Messages, task updates and invitations sync when you reconnect; other changes need a connection.';

const offlineText = (pendingChanges: number): string =>
  pendingChanges > 0
    ? `${formatCount(pendingChanges, 'change')} saved on this device. ${QUEUES_NOTE}`
    : `Showing what’s already loaded. ${QUEUES_NOTE}`;

const reconnectingText = (syncing: number): string =>
  syncing > 0
    ? `Syncing ${formatCount(syncing, 'change')} made while you were offline.`
    : 'Checking the connection.';

const syncFailedText = (work: PendingWork): string => {
  const verb = work.total === 1 ? 'is' : 'are';
  const retryHint =
    work.messages > 0 ? ' — failed messages also show Retry in their conversation' : '';
  return `${formatCount(work.total, 'change')} ${verb} still only on this device${retryHint}.`;
};

const offlineBar = (work: PendingWork): NetworkBarView => ({
  phase: 'offline',
  role: 'status',
  tone: 'ink',
  busy: false,
  icon: 'wifi-off',
  title: 'You’re offline.',
  text: offlineText(work.total),
  showDetails: true,
  action: { label: 'Retry', command: 'retry-connection' },
});

const reconnectingBar = (syncing: number): NetworkBarView => ({
  phase: 'reconnecting',
  role: 'status',
  tone: 'ink',
  busy: true,
  icon: 'refresh-cw',
  title: 'Reconnecting…',
  text: reconnectingText(syncing),
  showDetails: false,
  action: null,
});

const syncFailedBar = (work: PendingWork): NetworkBarView => ({
  phase: 'sync-failed',
  role: 'alert',
  tone: 'danger',
  busy: false,
  icon: 'circle-alert',
  title: 'Some changes didn’t sync.',
  text: syncFailedText(work),
  showDetails: false,
  action: { label: 'Retry sync', command: 'retry-sync' },
});

export const networkBarOf = (
  phase: ConnectionPhase,
  work: PendingWork,
  syncing: number,
): NetworkBarView | null => {
  switch (phase) {
    case 'offline':
      return offlineBar(work);
    case 'reconnecting':
      return reconnectingBar(syncing);
    case 'sync-failed':
      return syncFailedBar(work);
    default:
      return null;
  }
};
