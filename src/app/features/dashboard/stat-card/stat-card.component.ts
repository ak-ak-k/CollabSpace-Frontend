import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export type StatTone = 'default' | 'danger';
export type StatAvailability = 'loading' | 'unavailable' | 'ready';

export interface DashboardStat {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly value: number;
  readonly caption: string;
  readonly link: string;
  readonly tone: StatTone;
}

@Component({
  selector: 'app-dashboard-stat-card',
  imports: [RouterLink, IconComponent],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  host: {
    '[class.stat-card--danger]': "availability() === 'ready' && stat().tone === 'danger'",
  },
})
export class StatCardComponent {
  readonly stat = input.required<DashboardStat>();
  readonly availability = input<StatAvailability>('ready');
}
