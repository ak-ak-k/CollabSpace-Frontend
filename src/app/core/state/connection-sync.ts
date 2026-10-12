import { InjectionToken } from '@angular/core';
import { formatCount } from '../../shared/pipes/count.pipe';
import { PendingWork } from './pending-work';

export type ConnectionPhase = 'online' | 'offline' | 'reconnecting' | 'sync-failed';

export interface SyncDelays {
  readonly withChanges: number;
  readonly idle: number;
}

export const CONNECTION_SYNC_DELAYS = new InjectionToken<SyncDelays>('CONNECTION_SYNC_DELAYS', {
  factory: () => ({ withChanges: 1100, idle: 500 }),
});

export const OFFLINE_MESSAGE = 'You’re offline';
export const STILL_OFFLINE_RETRY_MESSAGE = 'Still offline — we’ll keep trying';
export const STILL_OFFLINE_SYNC_MESSAGE =
  'Still offline — changes sync when the connection returns';
export const RESTORED_MESSAGE = 'Connection restored';

export const syncDelayOf = (pendingChanges: number, delays: SyncDelays): number =>
  pendingChanges > 0 ? delays.withChanges : delays.idle;

export const syncSummaryOf = (synced: PendingWork): string => {
  const parts = [
    synced.messages > 0 ? `${formatCount(synced.messages, 'message')} sent` : '',
    synced.tasks > 0 ? `${formatCount(synced.tasks, 'task update')} synced` : '',
    synced.invites > 0 ? `${formatCount(synced.invites, 'invitation')} sent` : '',
  ].filter((part) => part !== '');
  return parts.length > 0 ? `${RESTORED_MESSAGE} — ${parts.join(', ')}` : RESTORED_MESSAGE;
};

export const visiblePhaseOf = (
  phase: ConnectionPhase,
  online: boolean,
  pendingChanges: number,
): ConnectionPhase => {
  if (!online) {
    return 'offline';
  }
  if (phase === 'offline') {
    return 'reconnecting';
  }
  return phase === 'sync-failed' && pendingChanges === 0 ? 'online' : phase;
};
