import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TaskStatus } from '../../../core/models/task';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { BoardColumn } from '../tasks-page.store';

export interface TaskDrop {
  readonly taskId: string;
  readonly status: TaskStatus;
  readonly beforeId?: string;
}

export interface TaskStep {
  readonly taskId: string;
  readonly step: -1 | 1;
}

const TOUCH_DRAG_DELAY = 250;
const ARROW_STEPS: Partial<Record<string, -1 | 1>> = { ArrowLeft: -1, ArrowRight: 1 };

@Component({
  selector: 'app-task-board',
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDropListGroup,
    IconButtonComponent,
    IconComponent,
    TaskCardComponent,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly columns = input.required<readonly BoardColumn[]>();
  readonly selectedId = input<string | null>(null);
  readonly canCreate = input(true, { transform: booleanAttribute });

  readonly open = output<string>();
  readonly dropped = output<TaskDrop>();
  readonly stepped = output<TaskStep>();
  readonly add = output<TaskStatus>();

  protected readonly dragDelay = { touch: TOUCH_DRAG_DELAY, mouse: 0 };
  private readonly focusAfterRender = signal<string | null>(null);

  constructor() {
    afterRenderEffect(() => {
      this.columns();
      const taskId = this.focusAfterRender();
      if (taskId) {
        this.cardElement(taskId)?.focus();
        this.focusAfterRender.set(null);
      }
    });
  }

  protected focusCard(taskId: string): void {
    this.focusAfterRender.set(taskId);
  }

  protected onKeydown(event: KeyboardEvent, taskId: string): void {
    const step = ARROW_STEPS[event.key];
    if (event.altKey && step) {
      event.preventDefault();
      this.focusAfterRender.set(taskId);
      this.stepped.emit({ taskId, step });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open.emit(taskId);
    }
  }

  protected onDrop(event: CdkDragDrop<TaskStatus, TaskStatus, string>): void {
    const sameColumn = event.previousContainer === event.container;
    if (sameColumn && event.previousIndex === event.currentIndex) {
      return;
    }
    const taskId = event.item.data;
    const column = this.columns().find((candidate) => candidate.status === event.container.data);
    const others = (column?.cards ?? []).filter((card) => card.id !== taskId);
    this.dropped.emit({
      taskId,
      status: event.container.data,
      beforeId: others[event.currentIndex]?.id,
    });
  }

  private cardElement(taskId: string): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>(`[data-task-id="${taskId}"]`);
  }
}
