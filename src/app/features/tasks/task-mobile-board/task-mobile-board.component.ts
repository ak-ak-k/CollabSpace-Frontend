import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TaskStatus } from '../../../core/models/task';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { TaskMobileCardComponent } from '../task-mobile-card/task-mobile-card.component';
import { BoardColumn } from '../tasks-page.store';

const DEFAULT_COLUMN: TaskStatus = 'progress';

@Component({
  selector: 'app-task-mobile-board',
  imports: [ButtonComponent, IconComponent, TabsComponent, TaskMobileCardComponent],
  templateUrl: './task-mobile-board.component.html',
  styleUrl: './task-mobile-board.component.scss',
})
export class TaskMobileBoardComponent {
  readonly columns = input.required<readonly BoardColumn[]>();
  readonly canCreate = input(true, { transform: booleanAttribute });

  readonly add = output<TaskStatus>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

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

  protected focusPanel(): void {
    this.panel()?.nativeElement.focus();
  }
}
