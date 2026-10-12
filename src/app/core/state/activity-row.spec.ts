import { ActivityEvent } from '../models/activity';
import {
  activityMetaText,
  ActivityRowLookup,
  activityRowOf,
  ActivityRowTeamInfo,
} from './activity-row';

const NOW = new Date(2026, 9, 6, 15, 0).getTime();
const HOUR = 3_600_000;

const event = (changes: Partial<ActivityEvent> = {}): ActivityEvent => ({
  id: 'e1',
  workspaceId: 'w1',
  actorId: 'u2',
  verb: 'moved',
  object: 'NS-142 to Review',
  occurredAt: NOW - HOUR,
  kind: 'task',
  route: '/tasks?task=NS-142',
  category: 'activity',
  entity: { type: 'task', id: 'NS-142' },
  teamId: 't-frontend',
  change: { from: 'In progress', to: 'Review' },
  action: 'task.status_changed',
  meta: null,
  outcome: 'succeeded',
  audit: false,
  ...changes,
});

const USERS: Readonly<Record<string, { id: string; name: string }>> = {
  u0: { id: 'u0', name: 'Aarav Shah' },
  u2: { id: 'u2', name: 'Rahul Mehta' },
};

const TEAMS: Readonly<Record<string, ActivityRowTeamInfo>> = {
  't-frontend': { id: 't-frontend', name: 'Frontend', archived: false },
  't-old': { id: 't-old', name: 'Legacy', archived: true },
};

const lookup: ActivityRowLookup = {
  viewerId: 'u0',
  user: (userId) => USERS[userId] ?? null,
  team: (teamId) => TEAMS[teamId] ?? null,
};

describe('activity row', () => {
  it('links the actor to their profile and the team to its page', () => {
    const row = activityRowOf(event(), lookup, NOW);

    expect(row.actor).toMatchObject({
      name: 'Rahul Mehta',
      shortName: 'Rahul',
      link: '/profile/u2',
      label: 'View profile of Rahul Mehta',
    });
    expect(row).toMatchObject({
      typeLabel: 'Task',
      icon: 'square-kanban',
      when: '1h ago',
      fullTime: '6 Oct 2026, 14:00',
      team: { id: 't-frontend', name: 'Frontend', link: '/teams/t-frontend' },
      outcomeLabel: 'Succeeded',
    });
  });

  it('shows me as You, unknown people as Someone and archived teams without a link', () => {
    expect(activityRowOf(event({ actorId: 'u0' }), lookup, NOW).actor).toMatchObject({
      name: 'You',
      link: '/profile',
    });
    expect(activityRowOf(event({ actorId: 'u9' }), lookup, NOW).actor).toMatchObject({
      name: 'Someone',
      avatarText: '?',
      link: null,
    });
    expect(activityRowOf(event({ teamId: 't-old' }), lookup, NOW).team).toEqual({
      id: 't-old',
      name: 'Legacy',
      link: null,
    });
  });

  it('labels the type and the outcome of workspace events', () => {
    const row = activityRowOf(
      event({ kind: 'invite', teamId: null, outcome: 'pending', action: 'invite.sent' }),
      lookup,
      NOW,
    );

    expect(row).toMatchObject({ typeLabel: 'Workspace', team: null, outcomeLabel: 'Pending sync' });
  });

  it('summarises meta context in one readable line', () => {
    expect(activityMetaText({ role: 'guest', team: 'Design', count: 3 })).toBe(
      'Role: Guest · Team: Design · 3 people',
    );
    expect(activityMetaText({ privacy: 'Private', count: 1 })).toBe('Private');
    expect(activityMetaText({ deleteOn: '26 October' })).toBe('Deletes on 26 October');
    expect(activityMetaText(null)).toBe('');
  });
});
