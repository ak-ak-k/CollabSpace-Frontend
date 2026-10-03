import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { OverviewStat } from '../workspace-overview/overview-view';

@Component({
  selector: 'app-overview-stats',
  imports: [IconComponent, RouterLink],
  templateUrl: './overview-stats.component.html',
  styleUrl: './overview-stats.component.scss',
})
export class OverviewStatsComponent {
  readonly stats = input.required<readonly OverviewStat[]>();
}
