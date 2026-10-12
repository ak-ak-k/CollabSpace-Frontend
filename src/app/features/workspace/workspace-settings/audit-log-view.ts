import {
  ActivityChange,
  ActivityEvent,
  ActivityKind,
  ActivityOutcome,
} from '../../../core/models/activity';
import { ActivityRow, formatFullTime } from '../../../core/state/activity-row';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SelectOption } from '../../../shared/ui/select/select.component';

export type AuditGroup = 'members' | 'roles' | 'permissions' | 'teams' | 'workspace' | 'security';
export type AuditCategory = AuditGroup | 'all';
export type AuditDateRange = 'any' | '7' | '30';

export interface AuditFilters {
  readonly category: AuditCategory;
  readonly actorId: string;
  readonly range: AuditDateRange;
}

export interface AuditCategoryChip {
  readonly value: AuditCategory;
  readonly label: string;
}

export interface AuditRow {
  readonly id: string;
  readonly iso: string;
  readonly when: string;
  readonly who: string;
  readonly category: string;
  readonly verb: string;
  readonly object: string;
  readonly route: string;
  readonly metaText: string;
  readonly change: ActivityChange | null;
  readonly outcome: ActivityOutcome;
  readonly outcomeLabel: string;
  readonly outcomeIcon: IconName;
}

export interface AuditEmptyCopy {
  readonly heading: string;
  readonly message: string;
}

export type AuditNameOf = (userId: string) => string | null;

export const AUDIT_PAGE_SIZE = 30;
export const ANY_ACTOR = '';
export const DEFAULT_AUDIT_FILTERS: AuditFilters = {
  category: 'all',
  actorId: ANY_ACTOR,
  range: 'any',
};

const MILLISECONDS_PER_DAY = 86_400_000;
const SELF_LABEL = 'You';
const UNKNOWN_ACTOR_LABEL = 'Someone';
const FALLBACK_GROUP: AuditGroup = 'workspace';

const AUDIT_GROUPS: Partial<Record<ActivityKind, AuditGroup>> = {
  invite: 'members',
  remove: 'members',
  role: 'roles',
  permission: 'permissions',
  team: 'teams',
  channel: 'teams',
  leave: 'teams',
  join: 'teams',
  archive: 'workspace',
  'workspace-settings': 'workspace',
  deletion: 'workspace',
  security: 'security',
  integration: 'security',
};

export const AUDIT_GROUP_LABELS: Record<AuditGroup, string> = {
  members: 'Members',
  roles: 'Roles',
  permissions: 'Permissions',
  teams: 'Teams & channels',
  workspace: 'Workspace',
  security: 'Security & integrations',
};

export const AUDIT_CATEGORY_CHIPS: readonly AuditCategoryChip[] = [
  { value: 'all', label: 'All events' },
  ...(Object.keys(AUDIT_GROUP_LABELS) as AuditGroup[]).map((value) => ({
    value,
    label: AUDIT_GROUP_LABELS[value],
  })),
];

const DATE_RANGE_DAYS: Record<AuditDateRange, number> = { any: 0, '7': 7, '30': 30 };

export const AUDIT_DATE_OPTIONS: readonly RadioOption[] = [
  { value: 'any', label: 'Any time' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
];

const OUTCOME_ICONS: Record<ActivityOutcome, IconName> = {
  succeeded: 'check',
  pending: 'clock',
  failed: 'circle-alert',
};

export const isAuditDateRange = (value: string): value is AuditDateRange =>
  Object.hasOwn(DATE_RANGE_DAYS, value);

export const auditGroupOf = (kind: ActivityKind): AuditGroup =>
  AUDIT_GROUPS[kind] ?? FALLBACK_GROUP;

export const auditSinceOf = (range: AuditDateRange, now: number): number => {
  const days = DATE_RANGE_DAYS[range];
  return days ? now - days * MILLISECONDS_PER_DAY : 0;
};

export const isAuditFiltered = (filters: AuditFilters): boolean =>
  filters.category !== DEFAULT_AUDIT_FILTERS.category ||
  filters.actorId !== DEFAULT_AUDIT_FILTERS.actorId ||
  filters.range !== DEFAULT_AUDIT_FILTERS.range;

export const filterAuditEvents = (
  events: readonly ActivityEvent[],
  filters: AuditFilters,
  now: number,
): readonly ActivityEvent[] => {
  const since = auditSinceOf(filters.range, now);
  return events.filter(
    (event) =>
      (filters.category === 'all' || auditGroupOf(event.kind) === filters.category) &&
      (filters.actorId === ANY_ACTOR || event.actorId === filters.actorId) &&
      event.occurredAt >= since,
  );
};

export const auditActorLabelOf = (
  actorId: string,
  currentUserId: string | null,
  nameOf: AuditNameOf,
): string => (actorId === currentUserId ? SELF_LABEL : (nameOf(actorId) ?? UNKNOWN_ACTOR_LABEL));

export const auditActorOptionsOf = (
  events: readonly ActivityEvent[],
  currentUserId: string | null,
  nameOf: AuditNameOf,
): readonly SelectOption[] => {
  const actorIds = [...new Set(events.map((event) => event.actorId))];
  const actors = actorIds
    .filter((actorId) => nameOf(actorId) !== null)
    .map((actorId) => ({
      value: actorId,
      label: auditActorLabelOf(actorId, currentUserId, nameOf),
    }));
  return [{ value: ANY_ACTOR, label: 'Anyone' }, ...actors];
};

export const formatAuditTime = formatFullTime;

export const auditRowOf = (row: ActivityRow): AuditRow => ({
  id: row.id,
  iso: row.iso,
  when: row.fullTime,
  who: row.actor.name,
  category: AUDIT_GROUP_LABELS[auditGroupOf(row.kind)],
  verb: row.verb,
  object: row.object,
  route: row.route,
  metaText: row.metaText,
  change: row.change,
  outcome: row.outcome,
  outcomeLabel: row.outcomeLabel,
  outcomeIcon: OUTCOME_ICONS[row.outcome],
});

export const auditCountLabel = (count: number, filtered: boolean): string => {
  if (!count) {
    return '';
  }
  const entries = count === 1 ? '1 entry' : `${count} entries`;
  if (!filtered) {
    return entries;
  }
  return `${entries} ${count === 1 ? 'matches' : 'match'} these filters`;
};

export const auditEmptyCopyOf = (filtered: boolean): AuditEmptyCopy =>
  filtered
    ? {
        heading: 'No events match these filters',
        message: 'Try another category, person or date range.',
      }
    : {
        heading: 'No administrative events yet',
        message: 'Role, permission, membership and security changes will be recorded here.',
      };
