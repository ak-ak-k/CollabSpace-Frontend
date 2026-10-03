import { TestBed } from '@angular/core/testing';
import { Task } from '../models/task';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TaskCommentState } from './task-comment.state';
import { TaskState } from './task.state';

describe('TaskCommentState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const firstTaskWithComments = async (): Promise<Task> => {
    const tasks = TestBed.inject(TaskState);
    await settle();
    const task = tasks.tasks().find((candidate) => candidate.commentCount > 0);
    if (!task) {
      throw new Error('The mock board has no commented task');
    }
    return task;
  };

  it('seeds at most two comments for a task', async () => {
    const task = await firstTaskWithComments();
    const comments = TestBed.inject(TaskCommentState).commentsFor(task);

    expect(comments.length).toBe(Math.min(task.commentCount, 2));
  });

  it('appends a new comment and bumps the task comment count', async () => {
    const task = await firstTaskWithComments();
    const state = TestBed.inject(TaskCommentState);

    await state.add(task, 'u0', '  Shipping today  ');

    const updated = TestBed.inject(TaskState).task(task.id);
    expect(state.commentsFor(updated ?? task).at(-1)?.text).toBe('Shipping today');
    expect(updated?.commentCount).toBe(task.commentCount + 1);
  });
});
