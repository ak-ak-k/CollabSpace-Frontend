import { Component, computed, input, output, signal } from '@angular/core';
import { TaskStatus } from '../../../core/models/task';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { BoardColumn } from '../task-board/task-board.component';
import { TaskCardComponent } from '../task-card/task-card.component';

const DEFAULT_COLUMN: TaskStatus = 'progress';

@Component({
  selector: 'app-task-mobile-board',
  imports: [ButtonComponent, IconComponent, TabsComponent, TaskCardComponent],
  templateUrl: './task-mobile-board.component.html',
  styleUrl: './task-mobile-board.component.scss',
})
export class TaskMobileBoardComponent {
  readonly columns = input.required<readonly BoardColumn[]>();

  readonly open = output<string>();
  readonly add = output<TaskStatus>();

  protected readonly activeStatus = signal<TaskStatus>(DEFAULT_COLUMN);
  protected readonly tabs = computed<readonly TabItem[]>(() =>
    this.columns().map((column) => ({
      id: column.status,
      label: column.label,
      count: column.cards.length,
    })),
  );
  protected readonly column = computed(
    () => this.columns().find((candidate) => candidate.status === this.activeStatus()) ?? null,
  );

  protected select(status: string): void {
    const match = this.columns().find((column) => column.status === status);
    if (match) {
      this.activeStatus.set(match.status);
    }
  }
}
