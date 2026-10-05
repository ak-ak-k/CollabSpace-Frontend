import { Component, computed, inject, input, signal } from '@angular/core';
import { Subtask, Task } from '../../../core/models/task';
import { ToastService } from '../../../core/services/toast.service';
import { subtaskProgressOf } from '../../../core/state/task-subtasks';
import { TaskState } from '../../../core/state/task.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { InputComponent } from '../../../shared/ui/input/input.component';

const PERCENT = 100;

@Component({
  selector: 'app-task-subtasks',
  imports: [ButtonComponent, CheckboxComponent, IconButtonComponent, IconComponent, InputComponent],
  templateUrl: './task-subtasks.component.html',
  styleUrl: './task-subtasks.component.scss',
})
export class TaskSubtasksComponent {
  private readonly tasks = inject(TaskState);
  private readonly toasts = inject(ToastService);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-subtasks');
  protected readonly draft = signal('');
  protected readonly progress = computed(() => subtaskProgressOf(this.task().subtasks));
  protected readonly percent = computed(() => {
    const { done, total } = this.progress();
    return total ? Math.round((done / total) * PERCENT) : 0;
  });
  protected readonly progressLabel = computed(() => {
    const { done, total } = this.progress();
    return total ? `${done} / ${total} completed` : 'None yet';
  });

  protected toggle(subtask: Subtask): void {
    void this.tasks.toggleSubtask(this.task().id, subtask.id);
  }

  protected rename(subtask: Subtask, field: HTMLInputElement): void {
    const title = field.value.trim();
    if (!title) {
      field.value = subtask.title;
    } else if (title !== subtask.title) {
      void this.tasks.renameSubtask(this.task().id, subtask.id, title);
    }
  }

  protected remove(subtask: Subtask): void {
    const taskId = this.task().id;
    const removed = this.tasks.removeSubtask(taskId, subtask.id);
    if (removed) {
      this.toasts.show('Subtask deleted', {
        icon: 'trash-2',
        actionLabel: 'Undo',
        onAction: () => void this.tasks.restoreSubtask(taskId, removed),
      });
    }
  }

  protected add(event: Event): void {
    event.preventDefault();
    const title = this.draft().trim();
    if (title) {
      void this.tasks.addSubtask(this.task().id, title);
      this.draft.set('');
    }
  }
}
