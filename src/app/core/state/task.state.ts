import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { TasksData } from '../data/tasks.data';
import { NewTask, Task, TaskStatus } from '../models/task';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

@Service()
export class TaskState {
  private readonly data = inject(TasksData);
  private readonly dataMode = inject(DataModeState);

  readonly tasks = signal<readonly Task[]>([]);

  private readonly loader = new Loadable<readonly Task[]>({
    fetch: () => this.data.getTasks(),
    store: (tasks) => this.tasks.set(tasks),
    isEmpty: (tasks) => tasks.length === 0,
  });

  readonly status = this.loader.status;
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
    const task = await this.data.createTask(newTask);
    this.tasks.update((tasks) => [...tasks, task]);
    this.refreshStatus();
    return task;
  }

  async move(id: string, status: TaskStatus, beforeId?: string): Promise<void> {
    this.tasks.set(await this.data.moveTask(id, status, beforeId));
  }

  async update(id: string, changes: Partial<Task>): Promise<void> {
    const updated = await this.data.updateTask(id, changes);
    this.tasks.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
  }

  async remove(id: string): Promise<void> {
    await this.data.deleteTask(id);
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
    this.refreshStatus();
  }

  private refreshStatus(): void {
    if (this.status() === 'ready' || this.status() === 'empty') {
      this.status.set(this.tasks().length ? 'ready' : 'empty');
    }
  }
}
