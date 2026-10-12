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
  readonly hasTask: (taskId: string) => boolean;
  readonly hasFile: (fileId: string) => boolean;
}

export interface ActivityVisibility {
  readonly canSeeTeam: (teamId: string) => boolean;
  readonly canSeeChannel: (channelId: string) => boolean;
}

export interface VisibleTeam {
  readonly isPrivate: boolean;
  readonly memberIds: readonly string[];
}

export interface VisibleChannel {
  readonly isPrivate: boolean;
  readonly memberIds: readonly string[];
}

const DEFAULT_CATEGORY: ActivityCategory = 'activity';
const DELETED_SUFFIX = ' (deleted)';

export const newestFirst = (first: ActivityEvent, second: ActivityEvent): number =>
  second.occurredAt - first.occurredAt;

export const isEntityGone = ({ entity }: ActivityEvent, scope: ActivityScope): boolean => {
  if (entity?.type === 'task') {
    return !scope.hasTask(entity.id);
  }
  return entity?.type === 'file' ? !scope.hasFile(entity.id) : false;
};

const withLiveEntity = (event: ActivityEvent, scope: ActivityScope): ActivityEvent =>
  isEntityGone(event, scope)
    ? { ...event, object: `${event.object}${DELETED_SUFFIX}`, route: '' }
    : event;

export const eventsInScope = (
  events: readonly ActivityEvent[],
  scope: ActivityScope,
): ActivityEvent[] =>
  events
    .filter((event) => event.workspaceId === scope.workspaceId)
    .map((event) => withLiveEntity(event, scope))
    .sort(newestFirst);

export const canSeeTeamActivity = (
  team: VisibleTeam | null,
  viewerId: string,
  isGuest: boolean,
): boolean => !team || (!team.isPrivate && !isGuest) || team.memberIds.includes(viewerId);

export const canSeeChannelActivity = (channel: VisibleChannel | null, viewerId: string): boolean =>
  !channel || !channel.isPrivate || channel.memberIds.includes(viewerId);

export const isActivityVisible = (event: ActivityEvent, visibility: ActivityVisibility): boolean =>
  (!event.teamId || visibility.canSeeTeam(event.teamId)) &&
  (event.entity?.type !== 'channel' || visibility.canSeeChannel(event.entity.id));

const isInCategory = (event: ActivityEvent, category: ActivityCategory): boolean =>
  event.category === category || (category === 'audit' && event.audit);

export const matchesActivityFilter = (event: ActivityEvent, filter: ActivityFilter): boolean =>
  isInCategory(event, filter.category ?? DEFAULT_CATEGORY) &&
  (!filter.teamId || event.teamId === filter.teamId) &&
  (!filter.actorId || event.actorId === filter.actorId) &&
  (!filter.group || ACTIVITY_GROUPS[event.kind] === filter.group) &&
  (!filter.since || event.occurredAt >= filter.since);

export const entityEventsOf = (
  events: readonly ActivityEvent[],
  type: ActivityEntityType,
  id: string,
): ActivityEvent[] =>
  events.filter(
    (event) =>
      event.category === DEFAULT_CATEGORY && event.entity?.type === type && event.entity.id === id,
  );
