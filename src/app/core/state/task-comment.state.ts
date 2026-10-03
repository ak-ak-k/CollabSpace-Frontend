import { inject, Service, signal } from '@angular/core';
import { seedTaskComments } from '../mocks/task-comments.mock';
import { Task, TaskComment } from '../models/task';
import { TaskState } from './task.state';

@Service()
export class TaskCommentState {
  private readonly tasks = inject(TaskState);
  private readonly added = signal<Readonly<Record<string, readonly TaskComment[]>>>({});
  private createdComments = 0;

  commentsFor(task: Task): readonly TaskComment[] {
    const added = this.added()[task.id] ?? [];
    const seeded = seedTaskComments({ ...task, commentCount: task.commentCount - added.length });
    return [...seeded, ...added];
  }

  async add(task: Task, authorId: string, text: string): Promise<TaskComment> {
    const comment: TaskComment = {
      id: `${task.id}-comment-${++this.createdComments}`,
      taskId: task.id,
      authorId,
      text: text.trim(),
      createdAt: Date.now(),
    };
    this.added.update((comments) => ({
      ...comments,
      [task.id]: [...(comments[task.id] ?? []), comment],
    }));
    await this.tasks.update(task.id, { commentCount: task.commentCount + 1 });
    return comment;
  }
}
