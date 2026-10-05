import { inject, Service } from '@angular/core';
import { MOCK_TASKS, SeededTask } from '../mocks/tasks.mock';
import { NewTask, Task, TaskChanges, TaskStatus } from '../models/task';
import { MockRequest } from './mock-request';

const TASK_ID_PREFIX = 'NS-';

export interface TaskAuthor {
  readonly workspaceId: string;
  readonly reporterId: string;
}

const withoutSeedFields = ({ attachmentCount: _attachments, ...task }: SeededTask): Task => task;

@Service()
export class TasksData {
  private readonly request = inject(MockRequest);

  private tasks: readonly Task[] = MOCK_TASKS.map(withoutSeedFields);

  getTasks(): Promise<readonly Task[]> {
    return this.request.read(() => this.tasks, []);
  }

  createTask(newTask: NewTask, author: TaskAuthor): Promise<Task> {
    return this.request.write(() => {
      const now = Date.now();
      const task: Task = {
        ...newTask,
        ...author,
        id: this.nextId(),
        labels: [],
        subtasks: [],
        createdAt: now,
        updatedAt: now,
        pending: false,
      };
      this.tasks = [...this.tasks, task];
      return task;
    });
  }

  moveTask(id: string, status: TaskStatus, beforeId?: string): Promise<readonly Task[]> {
    return this.request.write(() => {
      this.tasks = reorder(this.tasks, id, status, beforeId);
      return this.tasks;
    });
  }

  updateTask(id: string, changes: TaskChanges & Pick<Task, 'updatedAt'>): Promise<Task> {
    return this.request.write(() => {
      const current = this.tasks.find((task) => task.id === id);
      if (!current) {
        throw new Error(`Unknown task ${id}`);
      }
      const updated = { ...current, ...changes, id };
      this.tasks = this.tasks.map((task) => (task.id === id ? updated : task));
      return updated;
    });
  }

  deleteTask(id: string): Promise<void> {
    return this.request.write(() => {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    });
  }

  restoreTask(task: Task): Promise<void> {
    return this.request.write(() => {
      this.tasks = [...this.tasks.filter((candidate) => candidate.id !== task.id), task];
    });
  }

  syncTasks(tasks: readonly Task[]): Promise<void> {
    return this.request.write(() => {
      this.tasks = tasks.map((task) => ({ ...task, pending: false }));
    });
  }

  private nextId(): string {
    const numbers = this.tasks.map((task) =>
      Number.parseInt(task.id.slice(TASK_ID_PREFIX.length), 10),
    );
    return `${TASK_ID_PREFIX}${Math.max(0, ...numbers) + 1}`;
  }
}

export const reorder = (
  tasks: readonly Task[],
  id: string,
  status: TaskStatus,
  beforeId?: string,
): Task[] => {
  const moving = tasks.find((task) => task.id === id);
  if (!moving) {
    return [...tasks];
  }
  const remaining = tasks.filter((task) => task.id !== id);
  remaining.splice(insertionIndex(remaining, status, beforeId), 0, { ...moving, status });
  return remaining;
};

const insertionIndex = (tasks: readonly Task[], status: TaskStatus, beforeId?: string): number => {
  const beforeIndex = beforeId ? tasks.findIndex((task) => task.id === beforeId) : -1;
  if (beforeIndex >= 0) {
    return beforeIndex;
  }
  const lastInColumn = tasks.map((task) => task.status).lastIndexOf(status);
  return lastInColumn >= 0 ? lastInColumn + 1 : tasks.length;
};
