import { booleanAttribute, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TooltipDirective } from '../../../shared/ui/tooltip/tooltip.directive';
import { TaskMenuComponent } from '../task-menu/task-menu.component';
import { PENDING_SYNC_HINT, TaskCardView } from '../tasks-view';

@Component({
  selector: 'app-task-card',
  imports: [AvatarComponent, IconComponent, TagComponent, TaskMenuComponent, TooltipDirective],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  host: {
    '[class.task-card--selected]': 'selected()',
  },
})
export class TaskCardComponent {
  readonly card = input.required<TaskCardView>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly moved = output<string>();

  protected readonly pendingHint = PENDING_SYNC_HINT;
}
