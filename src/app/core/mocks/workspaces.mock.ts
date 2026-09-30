import { Workspace } from '../models/workspace';

export const CURRENT_WORKSPACE_ID = 'w1';

export const MOCK_WORKSPACES: readonly Workspace[] = [
  { id: 'w1', name: 'Northstar Labs', code: 'NL', memberCount: 48, plan: 'Business' },
  { id: 'w2', name: 'Orbit Studio', code: 'OS', memberCount: 12, plan: 'Free' },
  { id: 'w3', name: 'Kite Ventures', code: 'KV', memberCount: 7, plan: 'Guest access' },
];
