import { TestBed } from '@angular/core/testing';
import { NewTask } from '../models/task';
import { DataModeState } from './data-mode.state';
import { NetworkState } from './network.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TaskHistoryState } from './task-history.state';
import { TaskState } from './task.state';
import { WorkspaceState } from './workspace.state';

const newTask = (title: string): NewTask => ({
  title,
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  teamId: null,
  dueAt: Date.now(),
});

describe('TaskState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const loaded = async (): Promise<TaskState> => {
    const tasks = TestBed.inject(TaskState);
    await settle();
    return tasks;
  };

  it('loads the board, counts open tasks and derives teams from labels', async () => {
    const tasks = await loaded();

    expect(tasks.status()).toBe('ready');
    expect(tasks.tasks().length).toBe(15);
    expect(tasks.openCount()).toBe(12);
    expect(tasks.task('NS-139')?.teamId).toBe('t-platform');
    expect(tasks.task('NS-161')?.teamId).toBeNull();
    expect(tasks.task('NS-142')?.subtasks.length).toBe(4);
  });

  it('lists open tasks for a team', async () => {
    const tasks = await loaded();

    const ids = tasks.tasksForTeam('t-design').map((task) => task.id);

    expect(ids).toEqual(['NS-160', 'NS-147']);
  });

  it('moves a task and records the status change', async () => {
    const tasks = await loaded();
    const history = TestBed.inject(TaskHistoryState);

    await tasks.move('NS-151', 'review');

    const review = tasks.tasks().filter((task) => task.status === 'review');
    expect(review.at(-1)?.id).toBe('NS-151');
    expect(history.entriesFor('NS-151')[0]?.text).toBe('changed status: Todo → Review');
  });

  it('creates tasks with the next id and a created entry', async () => {
    const tasks = await loaded();

    const created = await tasks.create(newTask('Write release notes'));

    expect(created.id).toBe('NS-162');
    expect(created.reporterId).toBe('u0');
    expect(TestBed.inject(TaskHistoryState).entriesFor('NS-162')[0]?.text).toBe(
      'created this task',
    );
  });

  it('marks offline edits as pending and syncs them on reconnect', async () => {
    const tasks = await loaded();
    const network = TestBed.inject(NetworkState);

    network.simulateOffline(true);
    await tasks.update('NS-142', { priority: 'urgent' });
    expect(tasks.task('NS-142')?.pending).toBe(true);

    network.simulateOffline(false);
    await settle();
    await settle();

    expect(tasks.task('NS-142')?.pending).toBe(false);
    expect(tasks.task('NS-142')?.priority).toBe('urgent');
  });

  it('reports the forced error state', async () => {
    TestBed.inject(DataModeState).setMode('error');
    const tasks = await loaded();

    expect(tasks.status()).toBe('error');
  });

  it('only shows tasks from the current workspace', async () => {
    const tasks = await loaded();
    const workspace = TestBed.inject(WorkspaceState);

    workspace.switchWorkspace('w2');

    expect(tasks.tasks()).toEqual([]);
    expect(tasks.status()).toBe('empty');

    const created = await tasks.create(newTask('Brand refresh'));

    expect(created.workspaceId).toBe('w2');
    expect(tasks.status()).toBe('ready');
  });
});
