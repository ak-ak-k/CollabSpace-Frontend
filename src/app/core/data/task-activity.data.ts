import { inject, Service } from '@angular/core';
import { MOCK_TASK_COMMENTS } from '../mocks/task-comments.mock';
import { TaskComment } from '../models/task';
import { MockRequest } from './mock-request';

@Service()
export class TaskActivityData {
  private readonly request = inject(MockRequest);

  private comments: readonly TaskComment[] = MOCK_TASK_COMMENTS;

  getComments(): Promise<readonly TaskComment[]> {
    return this.request.read(() => this.comments, []);
  }

  saveComment(comment: TaskComment): Promise<void> {
    return this.request.write(() => {
      const exists = this.comments.some((candidate) => candidate.id === comment.id);
      this.comments = exists ? this.replaceComment(comment) : [...this.comments, comment];
    });
  }

  deleteComment(id: string): Promise<void> {
    return this.request.write(() => {
      this.comments = this.comments.filter((comment) => comment.id !== id);
    });
  }

  private replaceComment(comment: TaskComment): readonly TaskComment[] {
    return this.comments.map((candidate) => (candidate.id === comment.id ? comment : candidate));
  }
}
