import { inject, Service } from '@angular/core';
import { MOCK_TASKS } from '../mocks/tasks.mock';
import { NewTask, Task, TaskStatus } from '../models/task';
import { MockRequest } from './mock-request';

const TASK_ID_PREFIX = 'NS-';

@Service()
export class TasksData {
  private readonly request = inject(MockRequest);

  private tasks = [...MOCK_TASKS];

  getTasks(): Promise<readonly Task[]> {
    return this.request.read(() => this.tasks, []);
  }

  createTask(newTask: NewTask, workspaceId: string): Promise<Task> {
    return this.request.write(() => {
      const task: Task = {
        ...newTask,
        id: this.nextId(),
        workspaceId,
        labels: [],
        commentCount: 0,
        attachmentCount: 0,
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

  updateTask(id: string, changes: Partial<Task>): Promise<Task> {
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
