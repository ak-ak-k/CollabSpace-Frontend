import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { TaskActivityData } from '../data/task-activity.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { TaskHistoryEntry } from '../models/task';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

const newestFirst = (first: TaskHistoryEntry, second: TaskHistoryEntry): number =>
  second.at - first.at;

@Service()
export class TaskHistoryState {
  private readonly data = inject(TaskActivityData);
  private readonly dataMode = inject(DataModeState);

  private readonly entries = signal<readonly TaskHistoryEntry[]>([]);
  private recorded = 0;

  private readonly loader = new Loadable<readonly TaskHistoryEntry[]>({
    fetch: () => this.data.getHistory(),
    store: (entries) => this.entries.set(entries),
    isEmpty: (entries) => entries.length === 0,
  });

  private readonly entriesByTask = computed(() => {
    const byTask = new Map<string, TaskHistoryEntry[]>();
    this.entries().forEach((entry) =>
      byTask.set(entry.taskId, [...(byTask.get(entry.taskId) ?? []), entry]),
    );
    return byTask;
  });

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  entriesFor(taskId: string): readonly TaskHistoryEntry[] {
    return [...(this.entriesByTask().get(taskId) ?? [])].sort(newestFirst);
  }

  record(taskId: string, text: string, actorId = CURRENT_USER_ID): TaskHistoryEntry {
    const entry: TaskHistoryEntry = {
      id: `${taskId}-h${Date.now().toString(36)}${++this.recorded}`,
      taskId,
      actorId,
      text,
      at: Date.now(),
    };
    this.entries.update((entries) => [...entries, entry]);
    void this.data.addHistory(entry);
    return entry;
  }
}
