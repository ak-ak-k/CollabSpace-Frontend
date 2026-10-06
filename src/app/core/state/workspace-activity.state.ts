import { computed, inject, Service } from '@angular/core';
import { ActivityEntityType, ActivityEntry, ActivityEvent } from '../models/activity';
import { LoadStatus } from '../models/load-status';
import { ActivityLogState } from './activity-log.state';
import {
  ActivityFilter,
  ActivityScope,
  entityEventsOf,
  eventsInScope,
  matchesActivityFilter,
} from './activity-filter';
import { FileState } from './file.state';
import { settledStatus } from './loadable';
import { TaskState } from './task.state';
import { WorkspaceState } from './workspace.state';

const isSettled = (status: LoadStatus): boolean => status === 'ready' || status === 'empty';

@Service()
export class WorkspaceActivityState {
  private readonly log = inject(ActivityLogState);
  private readonly workspace = inject(WorkspaceState);
  private readonly tasks = inject(TaskState);
  private readonly files = inject(FileState);

  private readonly scope = computed<ActivityScope>(() => {
    const tasksKnown = isSettled(this.tasks.loadStatus());
    const filesKnown = isSettled(this.files.status());
    const taskIds = new Set(this.tasks.tasks().map((task) => task.id));
    const fileIds = new Set(this.files.files().map((file) => file.id));
    return {
      workspaceId: this.workspace.currentWorkspaceId(),
      visibleTeamIds: this.workspace.teamIds(),
      hasTask: (taskId) => !tasksKnown || taskIds.has(taskId),
      hasFile: (fileId) => !filesKnown || fileIds.has(fileId),
    };
  });

  private readonly currentEvents = computed(() => eventsInScope(this.log.events(), this.scope()));

  readonly status = settledStatus(this.log.loadStatus, () => this.currentEvents().length === 0);

  events(filter: ActivityFilter = {}): readonly ActivityEvent[] {
    return this.currentEvents().filter((event) => matchesActivityFilter(event, filter));
  }

  entityEvents(type: ActivityEntityType, id: string): readonly ActivityEvent[] {
    return entityEventsOf(this.log.events(), type, id);
  }

  reload(): Promise<void> {
    return this.log.reload();
  }

  record(entry: ActivityEntry, workspaceId?: string): string {
    return this.log.record(entry, workspaceId);
  }
}
