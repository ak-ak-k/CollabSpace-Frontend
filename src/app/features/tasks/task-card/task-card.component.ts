import { booleanAttribute, Component, input } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TaskCardView } from '../tasks-view';

@Component({
  selector: 'app-task-card',
  imports: [AvatarComponent, IconComponent, TagComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  host: {
    '[class.task-card--selected]': 'selected()',
  },
})
export class TaskCardComponent {
  readonly card = input.required<TaskCardView>();
  readonly showGrip = input(false, { transform: booleanAttribute });
  readonly selected = input(false, { transform: booleanAttribute });
}
