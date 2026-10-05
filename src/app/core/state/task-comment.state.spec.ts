import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TaskCommentState } from './task-comment.state';

describe('TaskCommentState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const loaded = async (): Promise<TaskCommentState> => {
    const comments = TestBed.inject(TaskCommentState);
    await settle();
    return comments;
  };

  it('seeds at most three comments per task', async () => {
    const comments = await loaded();

    expect(comments.countFor('NS-142')).toBe(3);
    expect(comments.countFor('NS-160')).toBe(1);
    expect(comments.countFor('NS-161')).toBe(0);
  });

  it('adds, edits and removes a comment', async () => {
    const comments = await loaded();

    const added = comments.add('NS-161', '  Shipping today  ');
    expect(comments.commentsFor('NS-161').map((comment) => comment.text)).toEqual([
      'Shipping today',
    ]);

    comments.edit(added.id, 'Shipping tomorrow');
    expect(comments.commentsFor('NS-161')[0]).toMatchObject({
      text: 'Shipping tomorrow',
      edited: true,
    });

    comments.remove(added.id);
    expect(comments.countFor('NS-161')).toBe(0);
  });
});
