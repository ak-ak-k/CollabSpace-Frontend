import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { NetworkState } from '../../../core/state/network.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import {
  NEEDS_CONNECTION,
  SystemPageComponent,
  WORKS_OFFLINE,
} from '../system-page/system-page.component';

const CONNECTION_CHECK_DELAY = 900;

@Component({
  selector: 'app-offline',
  imports: [RouterLink, SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './offline.component.html',
  styleUrl: './offline.component.scss',
})
export class OfflineComponent {
  private readonly network = inject(NetworkState);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly lists = [WORKS_OFFLINE, NEEDS_CONNECTION];
  protected readonly checking = signal(false);

  protected tryAgain(): void {
    if (this.checking()) {
      return;
    }
    this.checking.set(true);
    setTimeout(() => this.finishCheck(), CONNECTION_CHECK_DELAY);
  }

  private finishCheck(): void {
    this.checking.set(false);
    if (this.network.retry()) {
      void this.router.navigateByUrl('/home');
    } else {
      this.toasts.show('Still offline — we’ll retry automatically', { icon: 'wifi-off' });
    }
  }
}
