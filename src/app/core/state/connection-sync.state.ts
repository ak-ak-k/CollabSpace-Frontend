import { computed, DestroyRef, effect, inject, Service, signal, untracked } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { ChatMessagesState } from './chat-messages.state';
import {
  CONNECTION_SYNC_DELAYS,
  ConnectionPhase,
  OFFLINE_MESSAGE,
  STILL_OFFLINE_RETRY_MESSAGE,
  STILL_OFFLINE_SYNC_MESSAGE,
  syncDelayOf,
  syncSummaryOf,
  visiblePhaseOf,
} from './connection-sync';
import { InviteState } from './invite.state';
import { NetworkState } from './network.state';
import { PendingWorkState } from './pending-work.state';
import { TaskState } from './task.state';

@Service()
export class ConnectionSyncState {
  private readonly network = inject(NetworkState);
  private readonly pending = inject(PendingWorkState);
  private readonly messages = inject(ChatMessagesState);
  private readonly invites = inject(InviteState);
  private readonly tasks = inject(TaskState);
  private readonly toasts = inject(ToastService);
  private readonly delays = inject(CONNECTION_SYNC_DELAYS);

  private readonly currentPhase = signal<ConnectionPhase>(
    this.network.online() ? 'online' : 'offline',
  );
  private readonly changesSyncing = signal(0);
  private wasOnline = this.network.online();
  private syncTimer: ReturnType<typeof setTimeout> | undefined;

  readonly syncingCount = this.changesSyncing.asReadonly();
  readonly phase = computed(() =>
    visiblePhaseOf(this.currentPhase(), this.network.online(), this.pending.pendingWork().total),
  );

  constructor() {
    effect(() => {
      const online = this.network.online();
      untracked(() => this.follow(online));
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.syncTimer));
  }

  retryConnection(): void {
    if (!this.network.retry()) {
      this.toasts.show(STILL_OFFLINE_RETRY_MESSAGE, { icon: 'wifi-off' });
    }
  }

  retrySync(): void {
    if (this.network.offline()) {
      this.toasts.show(STILL_OFFLINE_SYNC_MESSAGE, { icon: 'wifi-off' });
      return;
    }
    this.sync();
  }

  private follow(online: boolean): void {
    if (online === this.wasOnline) {
      return;
    }
    this.wasOnline = online;
    if (online) {
      this.sync();
      return;
    }
    clearTimeout(this.syncTimer);
    this.currentPhase.set('offline');
    this.changesSyncing.set(0);
    this.toasts.show(OFFLINE_MESSAGE, { icon: 'wifi-off' });
  }

  private sync(): void {
    const waiting = this.pending.pendingWork().total;
    this.currentPhase.set('reconnecting');
    this.changesSyncing.set(waiting);
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.finishSync(), syncDelayOf(waiting, this.delays));
  }

  private finishSync(): void {
    if (this.network.offline()) {
      return;
    }
    const work = this.pending.pendingWork();
    this.changesSyncing.set(0);
    if (work.total > 0 && this.network.simulatedSyncFailure()) {
      this.messages.failQueue();
      this.invites.failQueued();
      this.currentPhase.set('sync-failed');
      return;
    }
    this.messages.flushQueue();
    void this.invites.flushQueued();
    void this.tasks.flushPending();
    this.currentPhase.set('online');
    this.toasts.show(syncSummaryOf(work), { icon: 'wifi' });
  }
}
