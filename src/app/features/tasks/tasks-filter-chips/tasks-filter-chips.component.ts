import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TaskChipRemoval, TaskFilterChip } from '../tasks-filters';

@Component({
  selector: 'app-tasks-filter-chips',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './tasks-filter-chips.component.html',
  styleUrl: './tasks-filter-chips.component.scss',
})
export class TasksFilterChipsComponent {
  readonly chips = input.required<readonly TaskFilterChip[]>();
  readonly remove = output<TaskChipRemoval>();
  readonly clearAll = output<void>();
}
