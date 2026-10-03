import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SystemPageComponent } from '../system-page/system-page.component';

export const RETURN_URL_PARAMETER = 'returnUrl';

const SESSION_EXPIRED_ROUTE = '/session-expired';

@Component({
  selector: 'app-session-expired',
  imports: [SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './session-expired.component.html',
  styleUrl: './session-expired.component.scss',
})
export class SessionExpiredComponent {
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly returnUrl = this.previousUrl();

  constructor() {
    inject(AuthState).expireSession();
  }

  protected logInAgain(): void {
    const queryParams = this.returnUrl
      ? { expired: 1, [RETURN_URL_PARAMETER]: this.returnUrl }
      : { expired: 1 };
    void this.router.navigate(['/login'], { queryParams });
  }

  protected contactAdmin(): void {
    this.toasts.show('Your admin is Kavya Reddy · kavya@northstar.io', { icon: 'mail' });
  }

  private previousUrl(): string | null {
    const previous =
      this.router.currentNavigation()?.previousNavigation?.finalUrl ??
      this.router.lastSuccessfulNavigation()?.finalUrl;
    const url = previous ? this.router.serializeUrl(previous) : null;
    return url && url !== SESSION_EXPIRED_ROUTE ? url : null;
  }
}
