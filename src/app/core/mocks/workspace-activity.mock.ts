import { WorkspaceActivityEvent, WorkspaceActivityKind } from '../models/workspace-activity';
import { MINUTES_PER_DAY, minutesAgo } from './mock-clock';

type ActivitySeed = readonly [
  id: string,
  workspaceId: string,
  actorId: string,
  verb: string,
  object: string,
  minutes: number,
  kind: WorkspaceActivityKind,
  route: string,
];

const MEMBERS_ROUTE = '/workspace/members';
const INVITES_ROUTE = '/workspace/settings/members';
const ADMINS_ROUTE = '/workspace/members/admins';

const ACTIVITY_SEEDS: readonly ActivitySeed[] = [
  ['wa1', 'w1', 'u24', 'joined', 'the Design team', 70, 'join', '/teams/t-design'],
  ['wa2', 'w1', 'u4', 'invited', 'rohan.verma@northstar.io', 150, 'invite', INVITES_ROUTE],
  ['wa3', 'w1', 'u4', 'made', 'Nandini Rao an Admin', 260, 'role', ADMINS_ROUTE],
  [
    'wa4',
    'w1',
    'u43',
    'invited',
    'neha.kapoor@northstar.io',
    MINUTES_PER_DAY + 60,
    'invite',
    INVITES_ROUTE,
  ],
  [
    'wa5',
    'w1',
    'u8',
    'created',
    '#api-v2 in Platform',
    MINUTES_PER_DAY + 200,
    'channel',
    '/teams/t-platform/c/c-api',
  ],
  [
    'wa6',
    'w1',
    'u44',
    'connected',
    'GitHub',
    2 * MINUTES_PER_DAY + 300,
    'integration',
    '/workspace/settings/integrations',
  ],
  [
    'wa7',
    'w1',
    'u5',
    'created',
    '#research in Design',
    3 * MINUTES_PER_DAY,
    'channel',
    '/teams/t-design/c/c-research',
  ],
  [
    'wa8',
    'w1',
    'u0',
    'turned on',
    'Google sign-in',
    4 * MINUTES_PER_DAY,
    'security',
    '/workspace/settings/security',
  ],
  ['wa9', 'w1', 'u39', 'joined', 'Northstar Labs', 5 * MINUTES_PER_DAY, 'join', MEMBERS_ROUTE],
  ['wa10', 'w1', 'u18', 'joined', 'Northstar Labs', 6 * MINUTES_PER_DAY, 'join', MEMBERS_ROUTE],
  ['wa11', 'w2', 'u24', 'joined', 'Orbit Studio', 2 * MINUTES_PER_DAY, 'join', MEMBERS_ROUTE],
  [
    'wa12',
    'w2',
    'u5',
    'invited',
    'sam@orbitstudio.design',
    2 * MINUTES_PER_DAY + 30,
    'invite',
    INVITES_ROUTE,
  ],
  ['wa13', 'w2', 'u5', 'made', 'Aarav Shah an Admin', 20 * MINUTES_PER_DAY, 'role', ADMINS_ROUTE],
  [
    'wa14',
    'w3',
    'u10',
    'added',
    'Aarav Shah as a guest',
    9 * MINUTES_PER_DAY,
    'invite',
    MEMBERS_ROUTE,
  ],
];

const toEvent = ([
  id,
  workspaceId,
  actorId,
  verb,
  object,
  minutes,
  kind,
  route,
]: ActivitySeed): WorkspaceActivityEvent => ({
  id,
  workspaceId,
  actorId,
  verb,
  object,
  occurredAt: minutesAgo(minutes),
  kind,
  route,
});

export const MOCK_WORKSPACE_ACTIVITY: readonly WorkspaceActivityEvent[] =
  ACTIVITY_SEEDS.map(toEvent);
