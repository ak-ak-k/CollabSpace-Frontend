import { Component, computed, inject, input, signal } from '@angular/core';
import { Task } from '../../../core/models/task';
import { TaskCommentState } from '../../../core/state/task-comment.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { TaskCommentComponent } from '../task-comment/task-comment.component';

@Component({
  selector: 'app-task-comments',
  imports: [ButtonComponent, TaskCommentComponent, TextareaComponent],
  templateUrl: './task-comments.component.html',
  styleUrl: './task-comments.component.scss',
})
export class TaskCommentsComponent {
  private readonly comments = inject(TaskCommentState);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-comments');
  protected readonly draft = signal('');
  protected readonly items = computed(() => this.comments.commentsFor(this.task().id));

  protected submit(event: Event): void {
    event.preventDefault();
    const text = this.draft().trim();
    if (text) {
      this.draft.set('');
      this.comments.add(this.task().id, text);
    }
  }
}
