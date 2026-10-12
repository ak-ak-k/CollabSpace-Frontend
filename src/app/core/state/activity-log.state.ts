import { effect, inject, Service, signal, untracked } from '@angular/core';
import { ActivityData } from '../data/activity.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import {
  activityCategoryOf,
  ActivityEntry,
  ActivityEvent,
  ActivityOutcome,
  legacyActionOf,
} from '../models/activity';
import { ActivityMatcher, withOutcome } from './activity-outcome';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';
import { WorkspaceState } from './workspace.state';

@Service()
export class ActivityLogState {
  private readonly data = inject(ActivityData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allEvents = signal<readonly ActivityEvent[]>([]);
  private recordedEvents = 0;

  private readonly loader = new Loadable<readonly ActivityEvent[]>({
    fetch: () => this.data.getActivity(),
    store: (events) => this.allEvents.set(events),
    isEmpty: (events) => events.length === 0,
  });

  readonly events = this.allEvents.asReadonly();
  readonly loadStatus = this.loader.status.asReadonly();

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  record(entry: ActivityEntry, workspaceId = this.workspace.currentWorkspaceId()): string {
    const occurredAt = Date.now();
    const event: ActivityEvent = {
      id: `wa-new-${occurredAt.toString(36)}-${++this.recordedEvents}`,
      workspaceId,
      actorId: CURRENT_USER_ID,
      verb: entry.verb,
      object: entry.object,
      occurredAt,
      kind: entry.kind,
      route: entry.route,
      category: activityCategoryOf(entry.kind, entry.category),
      entity: entry.entity ?? null,
      teamId: entry.teamId ?? null,
      change: entry.change ?? null,
      action: entry.action ?? legacyActionOf(entry.kind, entry.object),
      meta: entry.meta ?? null,
      outcome: entry.outcome ?? 'succeeded',
      audit: entry.audit ?? false,
    };
    this.allEvents.update((events) => [event, ...events]);
    void this.data.recordActivity(event);
    return event.id;
  }

  setOutcome(matches: ActivityMatcher, outcome: ActivityOutcome): number {
    const change = withOutcome(this.allEvents(), matches, outcome);
    if (change.changedIds.size > 0) {
      this.allEvents.set(change.events);
      void this.data.setOutcome(change.changedIds, outcome);
    }
    return change.changedIds.size;
  }
}
