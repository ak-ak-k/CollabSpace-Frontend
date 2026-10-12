import { TestBed } from '@angular/core/testing';
import { NewTask, taskRouteOf } from '../models/task';
import { DataModeState } from './data-mode.state';
import { NetworkState } from './network.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TaskState } from './task.state';
import { WorkspaceActivityState } from './workspace-activity.state';
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

  it('moves a task and logs the status change', async () => {
    const tasks = await loaded();
    const activity = TestBed.inject(WorkspaceActivityState);

    await tasks.move('NS-151', 'review');

    const review = tasks.tasks().filter((task) => task.status === 'review');
    expect(review.at(-1)?.id).toBe('NS-151');
    expect(activity.entityEvents('task', 'NS-151')[0]).toMatchObject({
      actorId: 'u0',
      verb: 'moved',
      object: 'NS-151 to Review',
      kind: 'task',
      category: 'activity',
      teamId: 't-frontend',
      change: { from: 'Todo', to: 'Review' },
    });
  });

  it('creates tasks with the next id and a created event', async () => {
    const tasks = await loaded();

    const created = await tasks.create(newTask('Write release notes'));

    expect(created.id).toBe('NS-162');
    expect(created.reporterId).toBe('u0');
    expect(TestBed.inject(WorkspaceActivityState).entityEvents('task', 'NS-162')[0]).toMatchObject({
      verb: 'created',
      object: 'NS-162 · Write release notes',
      route: '/tasks/NS-162',
    });
  });

  it('logs a deletion and drops the links of the deleted task', async () => {
    const tasks = await loaded();
    const activity = TestBed.inject(WorkspaceActivityState);

    await tasks.remove('NS-151');

    const events = activity.events().filter((event) => event.entity?.id === 'NS-151');
    expect(events[0]).toMatchObject({ verb: 'deleted', route: '' });
    expect(events.every((event) => event.route === '')).toBe(true);
  });

  it('marks deleted task events, then logs the restore after Undo', async () => {
    const tasks = await loaded();
    const activity = TestBed.inject(WorkspaceActivityState);

    const removed = await tasks.remove('NS-151');
    expect(activity.entityEvents('task', 'NS-151')[0].object).toContain('(deleted)');

    await tasks.restore(removed!);

    expect(activity.entityEvents('task', 'NS-151')[0]).toMatchObject({
      verb: 'restored',
      action: 'task.restored',
      route: taskRouteOf('NS-151'),
    });
  });

  it('logs reopening a done task and reassigning it with full names', async () => {
    const tasks = await loaded();
    const activity = TestBed.inject(WorkspaceActivityState);
    const done = tasks.tasks().find((task) => task.status === 'done' && task.assigneeId);

    await tasks.update(done!.id, { status: 'todo' });
    expect(activity.entityEvents('task', done!.id)[0]).toMatchObject({
      verb: 'reopened',
      action: 'task.reopened',
      change: { from: 'Done', to: 'Todo' },
    });

    await tasks.update(done!.id, { assigneeId: 'u0' });
    expect(activity.entityEvents('task', done!.id)[0]).toMatchObject({
      verb: 'reassigned',
      action: 'task.reassigned',
      object: `${done!.id} to Aarav`,
    });
  });

  it('marks offline edits and their events as pending until they are flushed', async () => {
    const tasks = await loaded();
    const network = TestBed.inject(NetworkState);
    const activity = TestBed.inject(WorkspaceActivityState);

    network.simulateOffline(true);
    await tasks.update('NS-142', { priority: 'urgent' });
    expect(tasks.task('NS-142')?.pending).toBe(true);
    expect(activity.entityEvents('task', 'NS-142')[0].outcome).toBe('pending');

    network.simulateOffline(false);
    expect(await tasks.flushPending()).toBe(1);

    expect(tasks.task('NS-142')?.pending).toBe(false);
    expect(tasks.task('NS-142')?.priority).toBe('urgent');
    expect(activity.entityEvents('task', 'NS-142')[0].outcome).toBe('succeeded');
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
