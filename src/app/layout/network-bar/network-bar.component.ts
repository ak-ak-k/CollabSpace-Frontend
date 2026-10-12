import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConnectionSyncState } from '../../core/state/connection-sync.state';
import { PendingWorkState } from '../../core/state/pending-work.state';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { NetworkBarCommand, networkBarOf } from './network-bar-view';

@Component({
  selector: 'app-network-bar',
  imports: [RouterLink, IconComponent, SpinnerComponent],
  templateUrl: './network-bar.component.html',
  styleUrl: './network-bar.component.scss',
  host: {
    '[attr.role]': 'view()?.role ?? null',
    '[class.network-bar--danger]': "view()?.tone === 'danger'",
  },
})
export class NetworkBarComponent {
  private readonly connection = inject(ConnectionSyncState);
  private readonly pending = inject(PendingWorkState);

  protected readonly view = computed(() =>
    networkBarOf(
      this.connection.phase(),
      this.pending.pendingWork(),
      this.connection.syncingCount(),
    ),
  );

  protected run(command: NetworkBarCommand): void {
    if (command === 'retry-sync') {
      this.connection.retrySync();
    } else {
      this.connection.retryConnection();
    }
  }
}
