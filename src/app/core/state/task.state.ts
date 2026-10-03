import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { reorder, TasksData } from '../data/tasks.data';
import { NewTask, Task, TaskStatus } from '../models/task';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

@Service()
export class TaskState {
  private readonly data = inject(TasksData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allTasks = signal<readonly Task[]>([]);

  private readonly loader = new Loadable<readonly Task[]>({
    fetch: () => this.data.getTasks(),
    store: (tasks) => this.allTasks.set(tasks),
    isEmpty: (tasks) => tasks.length === 0,
  });

  readonly tasks = computed(() => this.allTasks().filter((task) => this.workspace.contains(task)));
  readonly loadStatus = this.loader.status.asReadonly();
  readonly status = settledStatus(this.loader.status, () => this.tasks().length === 0);
  readonly openTasks = computed(() => this.tasks().filter((task) => task.status !== 'done'));
  readonly openCount = computed(() => this.openTasks().length);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  task(id: string): Task | null {
    return this.tasks().find((task) => task.id === id) ?? null;
  }

  async create(newTask: NewTask): Promise<Task> {
    const task = await this.data.createTask(newTask, this.workspace.currentWorkspaceId());
    this.allTasks.update((tasks) => [...tasks, task]);
    return task;
  }

  async move(id: string, status: TaskStatus, beforeId?: string): Promise<void> {
    this.allTasks.update((tasks) => reorder(tasks, id, status, beforeId));
    await this.data.moveTask(id, status, beforeId);
  }

  async update(id: string, changes: Partial<Task>): Promise<void> {
    this.allTasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, ...changes, id } : task)),
    );
    await this.data.updateTask(id, changes);
  }

  async remove(id: string): Promise<void> {
    await this.data.deleteTask(id);
    this.allTasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}
