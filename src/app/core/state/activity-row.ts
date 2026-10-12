import { formatRelative } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import {
  ACTIVITY_GROUPS,
  ACTIVITY_OUTCOME_LABELS,
  ACTIVITY_TYPE_LABELS,
  ActivityChange,
  ActivityEvent,
  activityIconOf,
  ActivityKind,
  ActivityMeta,
  ActivityOutcome,
} from '../models/activity';
import { ActivityAction } from '../models/activity-action';
import { firstNameOf, User, userColorSeed } from '../models/user';
import { WORKSPACE_ROLE_LABELS } from '../models/workspace-role';

export interface ActivityRowActor {
  readonly name: string;
  readonly shortName: string;
  readonly avatarName: string;
  readonly avatarText: string;
  readonly seed: number;
  readonly link: string | null;
  readonly label: string;
}

export interface ActivityRowTeam {
  readonly id: string;
  readonly name: string;
  readonly link: string | null;
}

export interface ActivityRow {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly action: ActivityAction;
  readonly occurredAt: number;
  readonly actor: ActivityRowActor;
  readonly verb: string;
  readonly object: string;
  readonly route: string;
  readonly change: ActivityChange | null;
  readonly icon: IconName;
  readonly typeLabel: string;
  readonly team: ActivityRowTeam | null;
  readonly when: string;
  readonly iso: string;
  readonly fullTime: string;
  readonly outcome: ActivityOutcome;
  readonly outcomeLabel: string;
  readonly metaText: string;
}

export interface ActivityRowTeamInfo {
  readonly id: string;
  readonly name: string;
  readonly archived: boolean;
}

export interface ActivityRowLookup {
  readonly viewerId: string;
  readonly user: (userId: string) => Pick<User, 'id' | 'name'> | null;
  readonly team: (teamId: string) => ActivityRowTeamInfo | null;
}

const SELF_LABEL = 'You';
const UNKNOWN_ACTOR = 'Someone';
const UNKNOWN_AVATAR_TEXT = '?';
const FALLBACK_TYPE_LABEL = 'Workspace';
const META_SEPARATOR = ' · ';
const PROFILE_ROUTE = '/profile';

const FULL_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatFullTime = (timestamp: number): string => FULL_TIME_FORMAT.format(timestamp);

const actorOf = (actorId: string, lookup: ActivityRowLookup): ActivityRowActor => {
  const user = lookup.user(actorId);
  const isMe = actorId === lookup.viewerId;
  if (!user) {
    return {
      name: UNKNOWN_ACTOR,
      shortName: UNKNOWN_ACTOR,
      avatarName: UNKNOWN_ACTOR,
      avatarText: UNKNOWN_AVATAR_TEXT,
      seed: userColorSeed(actorId),
      link: null,
      label: UNKNOWN_ACTOR,
    };
  }
  return {
    name: isMe ? SELF_LABEL : user.name,
    shortName: isMe ? SELF_LABEL : firstNameOf(user.name),
    avatarName: user.name,
    avatarText: '',
    seed: userColorSeed(actorId),
    link: isMe ? PROFILE_ROUTE : `${PROFILE_ROUTE}/${actorId}`,
    label: isMe ? 'View your profile' : `View profile of ${user.name}`,
  };
};

const teamOf = (teamId: string | null, lookup: ActivityRowLookup): ActivityRowTeam | null => {
  const team = teamId ? lookup.team(teamId) : null;
  return team
    ? { id: team.id, name: team.name, link: team.archived ? null : `/teams/${team.id}` }
    : null;
};

export const activityMetaText = (meta: ActivityMeta | null): string => {
  if (!meta) {
    return '';
  }
  const count = meta.count ?? 0;
  return [
    meta.role ? `Role: ${WORKSPACE_ROLE_LABELS[meta.role]}` : '',
    meta.team ? `Team: ${meta.team}` : '',
    count > 1 ? `${count} people` : '',
    meta.privacy ?? '',
    meta.deleteOn ? `Deletes on ${meta.deleteOn}` : '',
  ]
    .filter(Boolean)
    .join(META_SEPARATOR);
};

export const activityTypeLabelOf = (kind: ActivityKind): string => {
  const group = ACTIVITY_GROUPS[kind];
  return group ? ACTIVITY_TYPE_LABELS[group] : FALLBACK_TYPE_LABEL;
};

export const activityRowOf = (
  event: ActivityEvent,
  lookup: ActivityRowLookup,
  now = Date.now(),
): ActivityRow => ({
  id: event.id,
  kind: event.kind,
  action: event.action,
  occurredAt: event.occurredAt,
  actor: actorOf(event.actorId, lookup),
  verb: event.verb,
  object: event.object,
  route: event.route,
  change: event.change,
  icon: activityIconOf(event.kind),
  typeLabel: activityTypeLabelOf(event.kind),
  team: teamOf(event.teamId, lookup),
  when: formatRelative(event.occurredAt, now),
  iso: new Date(event.occurredAt).toISOString(),
  fullTime: formatFullTime(event.occurredAt),
  outcome: event.outcome,
  outcomeLabel: ACTIVITY_OUTCOME_LABELS[event.outcome],
  metaText: activityMetaText(event.meta),
});
