import { inject, Service } from '@angular/core';
import {
  ConnectionAction,
  needsConnectionMessage,
  OFFLINE_FORM_MESSAGE,
} from '../models/connection-actions';
import { NetworkState } from '../state/network.state';
import { ToastService } from './toast.service';

@Service()
export class ConnectionGuard {
  private readonly network = inject(NetworkState);
  private readonly toasts = inject(ToastService);

  allows(action: ConnectionAction): boolean {
    return this.online(needsConnectionMessage(action));
  }

  allowsSave(): boolean {
    return this.online(OFFLINE_FORM_MESSAGE);
  }

  recheck(action: ConnectionAction): () => boolean {
    return () => this.allows(action);
  }

  private online(refusal: string): boolean {
    if (this.network.online()) {
      return true;
    }
    this.toasts.show(refusal, { icon: 'cloud-off' });
    return false;
  }
}
