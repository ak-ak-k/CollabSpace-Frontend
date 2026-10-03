import { TestBed } from '@angular/core/testing';
import { DataModeState } from './data-mode.state';
import { TaskState } from './task.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceState } from './workspace.state';

describe('TaskState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  it('loads the board and counts open tasks', async () => {
    const tasks = TestBed.inject(TaskState);
    await settle();

    expect(tasks.status()).toBe('ready');
    expect(tasks.tasks().length).toBe(15);
    expect(tasks.openCount()).toBe(12);
  });

  it('moves a task to the end of another column', async () => {
    const tasks = TestBed.inject(TaskState);
    await settle();

    await tasks.move('NS-151', 'review');

    const review = tasks.tasks().filter((task) => task.status === 'review');
    expect(review.at(-1)?.id).toBe('NS-151');
  });

  it('creates tasks with the next id', async () => {
    const tasks = TestBed.inject(TaskState);
    await settle();

    const created = await tasks.create({
      title: 'Write release notes',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'u0',
      dueAt: Date.now(),
    });

    expect(created.id).toBe('NS-162');
    expect(tasks.task('NS-162')?.title).toBe('Write release notes');
  });

  it('reports the forced error state', async () => {
    TestBed.inject(DataModeState).setMode('error');
    const tasks = TestBed.inject(TaskState);
    await settle();

    expect(tasks.status()).toBe('error');
  });

  it('only shows tasks from the current workspace', async () => {
    const tasks = TestBed.inject(TaskState);
    const workspace = TestBed.inject(WorkspaceState);
    await settle();

    workspace.switchWorkspace('w2');

    expect(tasks.tasks()).toEqual([]);
    expect(tasks.status()).toBe('empty');

    const created = await tasks.create({
      title: 'Brand refresh',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: null,
      dueAt: Date.now(),
    });

    expect(created.workspaceId).toBe('w2');
    expect(tasks.status()).toBe('ready');
  });
});
