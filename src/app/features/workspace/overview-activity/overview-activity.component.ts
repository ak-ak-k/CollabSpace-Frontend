import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { OverviewActivityItem } from '../workspace-overview/overview-view';

const COLLAPSED_EVENT_COUNT = 7;

@Component({
  selector: 'app-overview-activity',
  imports: [
    AvatarComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
    SectionHeaderComponent,
  ],
  templateUrl: './overview-activity.component.html',
  styleUrl: './overview-activity.component.scss',
})
export class OverviewActivityComponent {
  readonly items = input.required<readonly OverviewActivityItem[]>();

  protected readonly expanded = signal(false);
  protected readonly caption = computed(() =>
    this.items().length ? formatCount(this.items().length, 'event') : '',
  );
  protected readonly canExpand = computed(() => this.items().length > COLLAPSED_EVENT_COUNT);
  protected readonly shown = computed(() =>
    this.expanded() ? this.items() : this.items().slice(0, COLLAPSED_EVENT_COUNT),
  );
  protected readonly toggleLabel = computed(() =>
    this.expanded() ? 'Show less' : `Show all ${this.items().length}`,
  );

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }
}
