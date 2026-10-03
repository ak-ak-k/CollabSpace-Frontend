import { Component, computed, inject, input, signal } from '@angular/core';
import { Task } from '../../../core/models/task';
import { userColorSeed } from '../../../core/models/user';
import { TaskCommentState } from '../../../core/state/task-comment.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { formatRelative } from '../../../shared/pipes/time-format';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

interface CommentView {
  readonly id: string;
  readonly authorName: string;
  readonly seed: number;
  readonly when: string;
  readonly text: string;
}

@Component({
  selector: 'app-task-comments',
  imports: [AvatarComponent, ButtonComponent, TextareaComponent],
  templateUrl: './task-comments.component.html',
  styleUrl: './task-comments.component.scss',
})
export class TaskCommentsComponent {
  private readonly comments = inject(TaskCommentState);
  private readonly workspace = inject(WorkspaceState);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-activity');
  protected readonly draft = signal('');
  protected readonly items = computed<readonly CommentView[]>(() =>
    this.comments.commentsFor(this.task()).map((comment) => ({
      id: comment.id,
      authorName: this.workspace.user(comment.authorId)?.name ?? 'Someone',
      seed: userColorSeed(comment.authorId),
      when: formatRelative(comment.createdAt),
      text: comment.text,
    })),
  );
  protected readonly heading = computed(
    () => `Activity · ${formatCount(this.items().length, 'comment')}`,
  );

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    const text = this.draft().trim();
    const authorId = this.workspace.currentUser()?.id;
    if (!text || !authorId) {
      return;
    }
    this.draft.set('');
    await this.comments.add(this.task(), authorId, text);
  }
}
