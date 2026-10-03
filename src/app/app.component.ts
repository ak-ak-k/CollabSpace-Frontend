import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppUpdateService } from './core/services/app-update.service';
import { InstallState } from './core/state/install.state';
import { ThemeState } from './core/state/theme.state';
import { ToastRegionComponent } from './shared/ui/toast/toast-region.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastRegionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly theme = inject(ThemeState);

  constructor() {
    inject(AppUpdateService).start();
    inject(InstallState);
  }
}
