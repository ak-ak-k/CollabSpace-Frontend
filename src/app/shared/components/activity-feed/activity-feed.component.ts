import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { ActivityRow } from '../../../core/state/activity-row';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { activityFeedGroupsOf } from './activity-feed-groups';

export type ActivityFeedVariant = 'rich' | 'timeline';

@Component({
  selector: 'app-activity-feed',
  imports: [AvatarComponent, IconComponent, RouterLink],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {
  private readonly router = inject(Router);

  readonly items = input.required<readonly ActivityRow[]>();
  readonly variant = input<ActivityFeedVariant>('rich');
  readonly grouped = input(false, { transform: booleanAttribute });
  readonly showTeam = input(true, { transform: booleanAttribute });
  readonly showType = input(false, { transform: booleanAttribute });
  readonly label = input('Activity');
  readonly idPrefix = input('g');

  private readonly rowElements = viewChildren<ElementRef<HTMLElement>>('rowElement');

  protected readonly groups = computed(() =>
    activityFeedGroupsOf(this.items(), {
      grouped: this.grouped(),
      label: this.label(),
      idPrefix: this.idPrefix(),
      now: Date.now(),
    }),
  );

  focusRow(index: number): void {
    this.rowElements()[index]?.nativeElement.focus();
  }

  protected linkTo(route: string): UrlTree {
    return this.router.parseUrl(route);
  }

  protected hasTimeSeparator(row: ActivityRow): boolean {
    return this.showType() || (this.showTeam() && !!row.team);
  }
}
