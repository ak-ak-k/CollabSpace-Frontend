import { Location } from '@angular/common';
import { Component, DestroyRef, DOCUMENT, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ErrorReportService } from '../../../core/services/error-report.service';
import { SERVER_ERROR_ROUTE } from '../../../core/services/navigation-error';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SystemPageComponent, USEFUL_PLACES } from '../system-page/system-page.component';

const HOME_ROUTE = '/home';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink, SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss',
})
export class ServerErrorComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly reports = inject(ErrorReportService);

  protected readonly lists = [USEFUL_PLACES];
  protected readonly reference = this.reports.reference;

  constructor() {
    if (!this.reference()) {
      this.reports.report();
    }
    inject(DestroyRef).onDestroy(() => this.reports.clear());
  }

  protected tryAgain(): void {
    const failedUrl = this.location.path();
    if (failedUrl && failedUrl !== SERVER_ERROR_ROUTE) {
      this.reload(failedUrl);
    } else {
      void this.router.navigateByUrl(HOME_ROUTE);
    }
  }

  private reload(url: string): void {
    this.window?.history.replaceState(null, '', this.location.prepareExternalUrl(url));
    this.window?.location.reload();
  }
}
