import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TaskMenuComponent } from '../task-menu/task-menu.component';
import { TaskCardView } from '../tasks-view';

export type TaskMobileCardVariant = 'board' | 'list';

@Component({
  selector: 'app-task-mobile-card',
  imports: [AvatarComponent, IconComponent, RouterLink, TagComponent, TaskMenuComponent],
  templateUrl: './task-mobile-card.component.html',
  styleUrl: './task-mobile-card.component.scss',
})
export class TaskMobileCardComponent {
  readonly card = input.required<TaskCardView>();
  readonly variant = input<TaskMobileCardVariant>('board');
  readonly moved = output<string>();
}
