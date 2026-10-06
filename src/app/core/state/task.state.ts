import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { reorder, TasksData } from '../data/tasks.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { NewTask, Subtask, Task, TaskChanges, TaskStatus } from '../models/task';
import { firstNameOf } from '../models/user';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { ActivityLogState } from './activity-log.state';
import { NetworkState } from './network.state';
import {
  createdNote,
  deletedNote,
  statusNote,
  taskActivityEntry,
  taskChangeNote,
  TaskNote,
  TaskNoteLookup,
} from './task-activity-note';
import {
  RemovedSubtask,
  withoutSubtask,
  withSubtaskAdded,
  withSubtaskRenamed,
  withSubtaskRestored,
  withSubtaskToggled,
} from './task-subtasks';
import { WorkspaceState } from './workspace.state';

@Service()
export class TaskState {
  private readonly data = inject(TasksData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);
  private readonly network = inject(NetworkState);
  private readonly activity = inject(ActivityLogState);

  private readonly allTasks = signal<readonly Task[]>([]);
  private createdSubtasks = 0;

  private readonly loader = new Loadable<readonly Task[]>({
    fetch: () => this.data.getTasks(),
    store: (tasks) => this.allTasks.set(tasks),
    isEmpty: (tasks) => tasks.length === 0,
  });

  private readonly noteLookup: TaskNoteLookup = {
    userName: (userId) => {
      const user = this.workspace.user(userId);
      return user ? firstNameOf(user.name) : null;
    },
    teamName: (teamId) => this.workspace.team(teamId)?.name ?? null,
  };

  readonly tasks = computed(() => this.allTasks().filter((task) => this.workspace.contains(task)));
  readonly loadStatus = this.loader.status.asReadonly();
  readonly status = settledStatus(this.loader.status, () => this.tasks().length === 0);
  readonly openTasks = computed(() => this.tasks().filter((task) => task.status !== 'done'));
  readonly openCount = computed(() => this.openTasks().length);
  readonly pendingCount = computed(() => this.allTasks().filter((task) => task.pending).length);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
    effect(() => {
      if (this.network.online() && untracked(this.pendingCount) > 0) {
        untracked(() => void this.syncPending());
      }
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  task(id: string): Task | null {
    return this.tasks().find((task) => task.id === id) ?? null;
  }

  tasksForTeam(teamId: string): readonly Task[] {
    return this.openTasks().filter((task) => task.teamId === teamId);
  }

  async create(newTask: NewTask): Promise<Task> {
    const task = await this.data.createTask(newTask, {
      workspaceId: this.workspace.currentWorkspaceId(),
      reporterId: CURRENT_USER_ID,
    });
    this.allTasks.update((tasks) => [...tasks, task]);
    this.log(task, createdNote(task));
    return task;
  }

  async move(id: string, status: TaskStatus, beforeId?: string): Promise<void> {
    const previous = this.task(id);
    if (!previous) {
      return;
    }
    const statusChanged = previous.status !== status;
    this.allTasks.update((tasks) =>
      reorder(tasks, id, status, beforeId).map((task) =>
        task.id === id && statusChanged ? { ...task, updatedAt: Date.now() } : task,
      ),
    );
    if (statusChanged) {
      this.log(previous, statusNote(previous, status));
    }
    if (!this.markPendingWhileOffline(id)) {
      await this.data.moveTask(id, status, beforeId);
    }
  }

  async update(id: string, changes: TaskChanges): Promise<void> {
    const previous = this.task(id);
    if (!previous) {
      return;
    }
    const stamped = { ...changes, updatedAt: Date.now() };
    this.replace(id, (task) => ({ ...task, ...stamped }));
    const note = taskChangeNote(previous, changes, this.noteLookup);
    if (note) {
      this.log(previous, note);
    }
    if (!this.markPendingWhileOffline(id)) {
      await this.data.updateTask(id, stamped);
    }
  }

  async remove(id: string): Promise<Task | null> {
    const removed = this.task(id);
    if (removed) {
      this.allTasks.update((tasks) => tasks.filter((task) => task.id !== id));
      this.log(removed, deletedNote(removed));
      await this.data.deleteTask(id);
    }
    return removed;
  }

  async restore(task: Task): Promise<void> {
    this.allTasks.update((tasks) => [...tasks.filter(({ id }) => id !== task.id), task]);
    await this.data.restoreTask(task);
  }

  addSubtask(id: string, title: string): Promise<void> {
    const subtaskId = `${id}-st${Date.now().toString(36)}${++this.createdSubtasks}`;
    return this.changeSubtasks(id, (subtasks) => withSubtaskAdded(subtasks, subtaskId, title));
  }

  toggleSubtask(id: string, subtaskId: string): Promise<void> {
    return this.changeSubtasks(id, (subtasks) => withSubtaskToggled(subtasks, subtaskId));
  }

  renameSubtask(id: string, subtaskId: string, title: string): Promise<void> {
    return this.changeSubtasks(id, (subtasks) => withSubtaskRenamed(subtasks, subtaskId, title));
  }

  removeSubtask(id: string, subtaskId: string): RemovedSubtask | null {
    const subtasks = this.task(id)?.subtasks ?? [];
    const index = subtasks.findIndex((subtask) => subtask.id === subtaskId);
    if (index < 0) {
      return null;
    }
    void this.changeSubtasks(id, (current) => withoutSubtask(current, subtaskId));
    return { subtask: subtasks[index], index };
  }

  restoreSubtask(id: string, removed: RemovedSubtask): Promise<void> {
    return this.changeSubtasks(id, (subtasks) => withSubtaskRestored(subtasks, removed));
  }

  markPendingWhileOffline(id: string): boolean {
    if (this.network.online()) {
      return false;
    }
    this.replace(id, (task) => ({ ...task, pending: true }));
    return true;
  }

  private changeSubtasks(
    id: string,
    change: (subtasks: readonly Subtask[]) => Subtask[],
  ): Promise<void> {
    const task = this.task(id);
    return task ? this.update(id, { subtasks: change(task.subtasks) }) : Promise.resolve();
  }

  log(task: Task, note: TaskNote): void {
    this.activity.record(taskActivityEntry(task, note), task.workspaceId);
  }

  private replace(id: string, change: (task: Task) => Task): void {
    this.allTasks.update((tasks) => tasks.map((task) => (task.id === id ? change(task) : task)));
  }

  private async syncPending(): Promise<void> {
    await this.data.syncTasks(this.allTasks());
    this.allTasks.update((tasks) =>
      tasks.map((task) => (task.pending ? { ...task, pending: false } : task)),
    );
  }
}
