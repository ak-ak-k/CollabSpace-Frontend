import {
  ActivityCategory,
  ActivityEntityType,
  ActivityEvent,
  ActivityGroup,
  ACTIVITY_GROUPS,
} from '../models/activity';

export interface ActivityFilter {
  readonly category?: ActivityCategory;
  readonly teamId?: string;
  readonly actorId?: string;
  readonly group?: ActivityGroup;
  readonly since?: number;
}

export interface ActivityScope {
  readonly workspaceId: string;
  readonly visibleTeamIds: ReadonlySet<string>;
  readonly hasTask: (taskId: string) => boolean;
  readonly hasFile: (fileId: string) => boolean;
}

const DEFAULT_CATEGORY: ActivityCategory = 'activity';

export const newestFirst = (first: ActivityEvent, second: ActivityEvent): number =>
  second.occurredAt - first.occurredAt;

export const isEntityGone = ({ entity }: ActivityEvent, scope: ActivityScope): boolean => {
  if (entity?.type === 'task') {
    return !scope.hasTask(entity.id);
  }
  return entity?.type === 'file' ? !scope.hasFile(entity.id) : false;
};

const isTeamVisible = (event: ActivityEvent, scope: ActivityScope): boolean =>
  event.category === 'audit' || !event.teamId || scope.visibleTeamIds.has(event.teamId);

const withLiveRoute = (event: ActivityEvent, scope: ActivityScope): ActivityEvent =>
  event.route && isEntityGone(event, scope) ? { ...event, route: '' } : event;

export const eventsInScope = (
  events: readonly ActivityEvent[],
  scope: ActivityScope,
): ActivityEvent[] =>
  events
    .filter((event) => event.workspaceId === scope.workspaceId && isTeamVisible(event, scope))
    .map((event) => withLiveRoute(event, scope))
    .sort(newestFirst);

export const matchesActivityFilter = (event: ActivityEvent, filter: ActivityFilter): boolean =>
  event.category === (filter.category ?? DEFAULT_CATEGORY) &&
  (!filter.teamId || event.teamId === filter.teamId) &&
  (!filter.actorId || event.actorId === filter.actorId) &&
  (!filter.group || ACTIVITY_GROUPS[event.kind] === filter.group) &&
  (!filter.since || event.occurredAt >= filter.since);

export const entityEventsOf = (
  events: readonly ActivityEvent[],
  type: ActivityEntityType,
  id: string,
): ActivityEvent[] =>
  events.filter((event) => event.entity?.type === type && event.entity.id === id).sort(newestFirst);
