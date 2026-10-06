import { initialRolePermissions, RolePermissionMap } from '../models/permission';
import { WorkspaceRole } from '../models/user';
import {
  Workspace,
  WorkspacePreferenceMap,
  WorkspacePreferences,
  WorkspaceRoster,
  WorkspaceRosters,
} from '../models/workspace';
import { MOCK_USERS } from './users.mock';

export const CURRENT_WORKSPACE_ID = 'w1';

const ACTIVE = { logoUrl: null, archivedAt: null, deleteAt: null };

export const MOCK_WORKSPACES: readonly Workspace[] = [
  {
    id: 'w1',
    name: 'Northstar Labs',
    code: 'NL',
    plan: 'Business',
    slug: 'northstar-labs',
    description: 'Build better products together. Home of Atlas, our customer workspace product.',
    createdLabel: 'Mar 2022',
    ownerId: 'u0',
    domain: 'northstar.io',
    ...ACTIVE,
  },
  {
    id: 'w2',
    name: 'Orbit Studio',
    code: 'OS',
    plan: 'Free',
    slug: 'orbit-studio',
    description: 'A small studio for brand, product and motion design.',
    createdLabel: 'Jan 2025',
    ownerId: 'u5',
    domain: 'orbitstudio.design',
    ...ACTIVE,
  },
  {
    id: 'w3',
    name: 'Kite Ventures',
    code: 'KV',
    plan: 'Pro',
    slug: 'kite-ventures',
    description: 'Founder support and portfolio collaboration.',
    createdLabel: 'Jun 2024',
    ownerId: 'u10',
    domain: 'kite.vc',
    ...ACTIVE,
  },
];

const rosterOf = (entries: readonly (readonly [string, WorkspaceRole])[]): WorkspaceRoster =>
  Object.fromEntries(entries);

const membersOf = (role: WorkspaceRole, userIds: readonly string[]) =>
  userIds.map((userId) => [userId, role] as const);

export const MOCK_WORKSPACE_ROSTERS: WorkspaceRosters = {
  w1: rosterOf(MOCK_USERS.map((user) => [user.id, user.role] as const)),
  w2: rosterOf([
    ['u5', 'owner'],
    ['u0', 'admin'],
    ...membersOf('member', ['u2', 'u9', 'u24', 'u25', 'u26', 'u27', 'u33', 'u31', 'u32', 'u41']),
  ]),
  w3: rosterOf([
    ['u10', 'owner'],
    ['u0', 'guest'],
    ['u30', 'admin'],
    ...membersOf('member', ['u37', 'u46', 'u41', 'u42']),
  ]),
};

export const BASE_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  whoCanInvite: 'admins',
  defaultRole: 'member',
  restrictDomains: false,
  domains: '',
  notifyDefault: 'mentions',
  digest: 'weekly',
  allowEveryone: true,
  defaultTheme: 'system',
  defaultDensity: 'comfortable',
  requireTwoFactor: false,
  sessionLength: '30 days',
  passwordSignIn: true,
  googleSignIn: true,
  defaultChannelId: '',
};

export const MOCK_WORKSPACE_PREFERENCES: WorkspacePreferenceMap = {
  w1: {
    ...BASE_WORKSPACE_PREFERENCES,
    whoCanInvite: 'everyone',
    domains: 'northstar.io',
    defaultChannelId: 'c-frontend',
  },
  w2: { ...BASE_WORKSPACE_PREFERENCES, domains: 'orbitstudio.design' },
  w3: { ...BASE_WORKSPACE_PREFERENCES, domains: 'kite.vc', requireTwoFactor: true },
};

export const MOCK_ROLE_PERMISSIONS: RolePermissionMap = Object.fromEntries(
  Object.entries(MOCK_WORKSPACE_PREFERENCES).map(([workspaceId, preferences]) => [
    workspaceId,
    initialRolePermissions(preferences.whoCanInvite),
  ]),
);
