import { booleanAttribute, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TaskMobileCardComponent } from '../task-mobile-card/task-mobile-card.component';
import { TaskCardView } from '../tasks-view';

@Component({
  selector: 'app-task-list',
  imports: [
    AvatarComponent,
    IconComponent,
    RouterLink,
    TableComponent,
    TagComponent,
    TaskMobileCardComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  readonly rows = input.required<readonly TaskCardView[]>();
  readonly caption = input.required<string>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly showTeam = input(true, { transform: booleanAttribute });

  readonly open = output<string>();
}
