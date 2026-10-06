import { inject, Service } from '@angular/core';
import { MOCK_TEAM_ACTIVITY } from '../mocks/activity.mock';
import { MOCK_TASK_EVENTS } from '../mocks/task-events.mock';
import { MOCK_WORKSPACE_ACTIVITY } from '../mocks/workspace-activity.mock';
import { MOCK_WORKSPACE_AUDIT } from '../mocks/workspace-audit.mock';
import { ActivityEvent } from '../models/activity';
import { MockRequest } from './mock-request';

@Service()
export class ActivityData {
  private readonly request = inject(MockRequest);

  private events: readonly ActivityEvent[] = [
    ...MOCK_WORKSPACE_ACTIVITY,
    ...MOCK_WORKSPACE_AUDIT,
    ...MOCK_TEAM_ACTIVITY,
    ...MOCK_TASK_EVENTS,
  ];

  getActivity(): Promise<readonly ActivityEvent[]> {
    return this.request.read(() => this.events, []);
  }

  recordActivity(event: ActivityEvent): Promise<void> {
    return this.request.write(() => {
      this.events = [event, ...this.events];
    });
  }
}
