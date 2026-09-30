import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-offline-banner',
  imports: [RouterLink, IconComponent],
  templateUrl: './offline-banner.component.html',
  styleUrl: './offline-banner.component.scss',
  host: { role: 'status' },
})
export class OfflineBannerComponent {
  readonly retry = output<void>();
}
