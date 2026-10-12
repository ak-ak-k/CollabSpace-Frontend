import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../core/state/auth.state';
import { SessionReturnState } from '../../../core/state/session-return.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SystemPageComponent } from '../system-page/system-page.component';

const LOGIN_ROUTE = '/login';
const SESSION_EXPIRED_PARAMETER = 'expired';

@Component({
  selector: 'app-session-expired',
  imports: [SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './session-expired.component.html',
  styleUrl: './session-expired.component.scss',
})
export class SessionExpiredComponent {
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly auth = inject(AuthState);
  private readonly sessionReturn = inject(SessionReturnState);

  protected logInAgain(): void {
    this.sessionReturn.stash();
    this.auth.expireSession();
    void this.router.navigate([LOGIN_ROUTE], {
      queryParams: { [SESSION_EXPIRED_PARAMETER]: 1 },
    });
  }

  protected contactAdmin(): void {
    this.toasts.show('Your admin is Kavya Reddy · kavya@northstar.io', { icon: 'mail' });
  }
}
