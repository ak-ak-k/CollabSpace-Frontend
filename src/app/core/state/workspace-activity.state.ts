import { computed, inject, Service } from '@angular/core';
import { ActivityEntityType, ActivityEntry, ActivityEvent } from '../models/activity';
import { LoadStatus } from '../models/load-status';
import { ActivityLogState } from './activity-log.state';
import {
  ActivityFilter,
  ActivityScope,
  ActivityVisibility,
  canSeeChannelActivity,
  canSeeTeamActivity,
  entityEventsOf,
  eventsInScope,
  isActivityVisible,
  matchesActivityFilter,
} from './activity-filter';
import { ActivityRow, ActivityRowLookup, activityRowOf } from './activity-row';
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

  private readonly viewerId = computed(() => this.workspace.currentUser()?.id ?? '');

  private readonly scope = computed<ActivityScope>(() => {
    const tasksKnown = isSettled(this.tasks.loadStatus());
    const filesKnown = isSettled(this.files.status());
    const taskIds = new Set(this.tasks.tasks().map((task) => task.id));
    const fileIds = new Set(this.files.files().map((file) => file.id));
    return {
      workspaceId: this.workspace.currentWorkspaceId(),
      hasTask: (taskId) => !tasksKnown || taskIds.has(taskId),
      hasFile: (fileId) => !filesKnown || fileIds.has(fileId),
    };
  });

  private readonly visibility = computed<ActivityVisibility>(() => {
    const viewerId = this.viewerId();
    const isGuest = this.workspace.access().isGuest;
    const channels = new Map(this.workspace.channels().map((channel) => [channel.id, channel]));
    return {
      canSeeTeam: (teamId) => canSeeTeamActivity(this.workspace.anyTeam(teamId), viewerId, isGuest),
      canSeeChannel: (channelId) =>
        canSeeChannelActivity(channels.get(channelId) ?? null, viewerId),
    };
  });

  private readonly rowLookup = computed<ActivityRowLookup>(() => ({
    viewerId: this.viewerId(),
    user: (userId) => this.workspace.user(userId),
    team: (teamId) => this.workspace.anyTeam(teamId),
  }));

  private readonly currentEvents = computed(() => eventsInScope(this.log.events(), this.scope()));
  private readonly visibleActivity = computed(() =>
    this.currentEvents().filter((event) => isActivityVisible(event, this.visibility())),
  );

  readonly status = settledStatus(this.log.loadStatus, () => this.currentEvents().length === 0);

  events(filter: ActivityFilter = {}): readonly ActivityEvent[] {
    if (filter.category === 'audit') {
      return this.workspace.can('audit.view')
        ? this.currentEvents().filter((event) => matchesActivityFilter(event, filter))
        : [];
    }
    return this.visibleActivity().filter((event) => matchesActivityFilter(event, filter));
  }

  entityEvents(type: ActivityEntityType, id: string): readonly ActivityEvent[] {
    return entityEventsOf(this.currentEvents(), type, id);
  }

  rows(filter: ActivityFilter = {}, now = Date.now()): readonly ActivityRow[] {
    return this.toRows(this.events(filter), now);
  }

  entityRows(type: ActivityEntityType, id: string, now = Date.now()): readonly ActivityRow[] {
    return this.toRows(this.entityEvents(type, id), now);
  }

  toRows(events: readonly ActivityEvent[], now = Date.now()): readonly ActivityRow[] {
    const lookup = this.rowLookup();
    return events.map((event) => activityRowOf(event, lookup, now));
  }

  reload(): Promise<void> {
    return this.log.reload();
  }

  record(entry: ActivityEntry, workspaceId?: string): string {
    return this.log.record(entry, workspaceId);
  }
}
