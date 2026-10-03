import { WorkspaceInvite } from '../models/workspace-invite';
import { MINUTES_PER_DAY, minutesAgo } from './mock-clock';

const PENDING = { teamId: null, queued: false };

export const MOCK_WORKSPACE_INVITES: readonly WorkspaceInvite[] = [
  {
    id: 'i1',
    workspaceId: 'w1',
    email: 'rohan.verma@northstar.io',
    role: 'member',
    invitedById: 'u4',
    invitedAt: minutesAgo(150),
    ...PENDING,
  },
  {
    id: 'i2',
    workspaceId: 'w1',
    email: 'neha.kapoor@northstar.io',
    role: 'member',
    invitedById: 'u43',
    invitedAt: minutesAgo(MINUTES_PER_DAY + 60),
    ...PENDING,
  },
  {
    id: 'i3',
    workspaceId: 'w1',
    email: 'jordan@lumenpartners.com',
    role: 'guest',
    invitedById: 'u0',
    invitedAt: minutesAgo(3 * MINUTES_PER_DAY),
    ...PENDING,
  },
  {
    id: 'i4',
    workspaceId: 'w2',
    email: 'sam@orbitstudio.design',
    role: 'member',
    invitedById: 'u5',
    invitedAt: minutesAgo(2 * MINUTES_PER_DAY + 30),
    ...PENDING,
  },
];
