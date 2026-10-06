import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { TaskActivityData } from '../data/task-activity.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { TaskComment } from '../models/task';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';
import { commentedNote } from './task-activity-note';
import { TaskState } from './task.state';

@Service()
export class TaskCommentState {
  private readonly data = inject(TaskActivityData);
  private readonly dataMode = inject(DataModeState);
  private readonly tasks = inject(TaskState);

  private readonly comments = signal<readonly TaskComment[]>([]);
  private created = 0;

  private readonly loader = new Loadable<readonly TaskComment[]>({
    fetch: () => this.data.getComments(),
    store: (comments) => this.comments.set(comments),
    isEmpty: (comments) => comments.length === 0,
  });

  private readonly commentsByTask = computed(() => {
    const byTask = new Map<string, TaskComment[]>();
    this.comments().forEach((comment) =>
      byTask.set(comment.taskId, [...(byTask.get(comment.taskId) ?? []), comment]),
    );
    return byTask;
  });

  readonly counts = computed<ReadonlyMap<string, number>>(
    () =>
      new Map([...this.commentsByTask()].map(([taskId, comments]) => [taskId, comments.length])),
  );

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  commentsFor(taskId: string): readonly TaskComment[] {
    return this.commentsByTask().get(taskId) ?? [];
  }

  countFor(taskId: string): number {
    return this.counts().get(taskId) ?? 0;
  }

  add(taskId: string, text: string, authorId = CURRENT_USER_ID): TaskComment {
    const comment: TaskComment = {
      id: `${taskId}-tc${Date.now().toString(36)}${++this.created}`,
      taskId,
      authorId,
      text: text.trim(),
      createdAt: Date.now(),
      edited: false,
    };
    this.comments.update((comments) => [...comments, comment]);
    this.logComment(taskId);
    this.tasks.markPendingWhileOffline(taskId);
    void this.data.saveComment(comment);
    return comment;
  }

  edit(commentId: string, text: string): void {
    const current = this.comments().find((comment) => comment.id === commentId);
    const trimmed = text.trim();
    if (!current || !trimmed || trimmed === current.text) {
      return;
    }
    const edited: TaskComment = { ...current, text: trimmed, edited: true };
    this.comments.update((comments) =>
      comments.map((comment) => (comment.id === commentId ? edited : comment)),
    );
    this.tasks.markPendingWhileOffline(current.taskId);
    void this.data.saveComment(edited);
  }

  remove(commentId: string): TaskComment | null {
    const removed = this.comments().find((comment) => comment.id === commentId) ?? null;
    if (removed) {
      this.comments.update((comments) => comments.filter((comment) => comment.id !== commentId));
      this.tasks.markPendingWhileOffline(removed.taskId);
      void this.data.deleteComment(commentId);
    }
    return removed;
  }

  private logComment(taskId: string): void {
    const task = this.tasks.task(taskId);
    if (task) {
      this.tasks.log(task, commentedNote(task));
    }
  }
}
