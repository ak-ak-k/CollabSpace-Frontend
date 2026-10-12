import { ActivityEvent, settledRecordFields, WorkspaceActivityKind } from '../models/activity';
import { MINUTES_PER_DAY, minutesAgo } from './mock-clock';

type AuditSeed = readonly [
  id: string,
  actorId: string,
  kind: WorkspaceActivityKind,
  verb: string,
  object: string,
  daysAgo: number,
  route: string,
  change: readonly [from: string, to: string] | null,
];

const NORTHSTAR_ID = 'w1';
const SETTINGS_ROUTE = '/workspace/settings';
const MEMBERS_ROUTE = '/workspace/members';
const ROLES_ROUTE = `${SETTINGS_ROUTE}/roles`;
const SECURITY_ROUTE = `${SETTINGS_ROUTE}/security`;
const INVITES_ROUTE = `${SETTINGS_ROUTE}/members`;
const GENERAL_ROUTE = `${SETTINGS_ROUTE}/general`;
const INTEGRATIONS_ROUTE = `${SETTINGS_ROUTE}/integrations`;

const NORTHSTAR_AUDIT_SEEDS: readonly AuditSeed[] = [
  [
    'wa15',
    'u0',
    'permission',
    'turned on “Create channels” for',
    'Members',
    3.2,
    ROLES_ROUTE,
    ['Not allowed', 'Allowed'],
  ],
  [
    'wa16',
    'u4',
    'security',
    'changed',
    'session length',
    6.45,
    SECURITY_ROUTE,
    ['7 days', '30 days'],
  ],
  ['wa17', 'u0', 'remove', 'removed', 'Rhea Malhotra', 9.1, MEMBERS_ROUTE, null],
  [
    'wa18',
    'u8',
    'role',
    'made',
    'Joseph Mathew an Admin',
    12.6,
    MEMBERS_ROUTE,
    ['Member', 'Admin'],
  ],
  [
    'wa19',
    'u0',
    'workspace-settings',
    'renamed the workspace',
    'to Northstar Labs',
    18.3,
    GENERAL_ROUTE,
    ['Northstar', 'Northstar Labs'],
  ],
  [
    'wa20',
    'u0',
    'permission',
    'turned on “Invite people” for',
    'Members',
    25.75,
    ROLES_ROUTE,
    ['Not allowed', 'Allowed'],
  ],
  [
    'wa21',
    'u4',
    'security',
    'changed',
    'approved email domains',
    33.4,
    INVITES_ROUTE,
    ['—', 'northstar.io'],
  ],
  [
    'wa22',
    'u44',
    'integration',
    'disconnected',
    'Jira',
    40.15,
    INTEGRATIONS_ROUTE,
    ['Connected', 'Not connected'],
  ],
  [
    'wa23',
    'u8',
    'invite',
    'revoked the invitation to',
    'alex@brightlabs.dev',
    52.55,
    INVITES_ROUTE,
    null,
  ],
  [
    'wa24',
    'u0',
    'integration',
    'connected',
    'Figma',
    61.3,
    INTEGRATIONS_ROUTE,
    ['Not connected', 'Connected'],
  ],
];

const toAuditEvent = ([
  id,
  actorId,
  kind,
  verb,
  object,
  daysAgo,
  route,
  change,
]: AuditSeed): ActivityEvent => ({
  id,
  workspaceId: NORTHSTAR_ID,
  actorId,
  verb,
  object,
  occurredAt: minutesAgo(daysAgo * MINUTES_PER_DAY),
  kind,
  route,
  category: 'audit',
  entity: null,
  teamId: null,
  change: change ? { from: change[0], to: change[1] } : null,
  ...settledRecordFields(kind, object),
});

export const MOCK_WORKSPACE_AUDIT: readonly ActivityEvent[] =
  NORTHSTAR_AUDIT_SEEDS.map(toAuditEvent);
