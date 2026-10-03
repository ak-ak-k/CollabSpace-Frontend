import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { WorkspaceData } from '../data/workspace.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { WorkspaceActivityEvent, WorkspaceActivityKind } from '../models/workspace-activity';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

export interface ActivityEntry {
  readonly kind: WorkspaceActivityKind;
  readonly verb: string;
  readonly object: string;
  readonly route: string;
}

@Service()
export class WorkspaceActivityState {
  private readonly data = inject(WorkspaceData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allEvents = signal<readonly WorkspaceActivityEvent[]>([]);
  private recordedEvents = 0;

  private readonly loader = new Loadable<readonly WorkspaceActivityEvent[]>({
    fetch: () => this.data.getActivity(),
    store: (events) => this.allEvents.set(events),
    isEmpty: (events) => events.length === 0,
  });

  readonly events = computed(() =>
    this.allEvents()
      .filter((event) => this.workspace.contains(event))
      .sort((first, second) => second.occurredAt - first.occurredAt),
  );
  readonly status = settledStatus(this.loader.status, () => this.events().length === 0);

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
    const event: WorkspaceActivityEvent = {
      ...entry,
      id: `wa-new-${occurredAt.toString(36)}-${++this.recordedEvents}`,
      workspaceId,
      actorId: CURRENT_USER_ID,
      occurredAt,
    };
    this.allEvents.update((events) => [event, ...events]);
    void this.data.recordActivity(event);
    return event.id;
  }

  remove(eventId: string): void {
    this.allEvents.update((events) => events.filter((event) => event.id !== eventId));
    void this.data.removeActivity(eventId);
  }
}
