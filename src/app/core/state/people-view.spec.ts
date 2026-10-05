import { Team } from '../models/team';
import { User } from '../models/user';
import {
  departmentsOf,
  EVERYONE,
  filterPeople,
  NO_TEAM,
  peopleStatusFilterOf,
  statusCountsOf,
} from './people-view';

const NOW = new Date(2026, 9, 3, 15, 0).getTime();
const HOUR = 3_600_000;

const person = (id: string, name: string, changes: Partial<User> = {}): User => ({
  id,
  name,
  title: 'Engineer',
  department: 'Engineering',
  email: `${id}@northstar.io`,
  status: 'offline',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST · UTC+5:30',
  location: 'Pune, India',
  role: 'member',
  ...changes,
});

const people: readonly User[] = [
  person('u1', 'Zoya Khan', { status: 'dnd', department: 'Design' }),
  person('u2', 'Aditi Menon', { status: 'away', lastActiveAt: NOW - HOUR }),
  person('u3', 'Clara Mendes', { lastSeenAt: NOW - 3 * HOUR }),
  person('u4', 'Rohan Kapoor', { lastSeenAt: NOW - 30 * HOUR }),
];

const teams: readonly Team[] = [
  {
    workspaceId: 'w1',
    id: 't1',
    name: 'Frontend',
    code: 'FE',
    description: '',
    memberIds: ['u1', 'u2'],
    leadId: 'u1',
    ownerId: 'u1',
    adminIds: [],
    channelIds: [],
    activityLevel: 'Active',
    weeklyMessageCount: 0,
    createdLabel: 'Jan 2026',
    joined: true,
    isPrivate: false,
    archived: false,
  },
];

const namesOf = (users: readonly User[]) => users.map((user) => user.name);

describe('people view', () => {
  it('falls back to everyone for unknown status filters', () => {
    expect(peopleStatusFilterOf('recent')).toBe('recent');
    expect(peopleStatusFilterOf('zzz')).toBe('all');
    expect(peopleStatusFilterOf(undefined)).toBe('all');
  });

  it('counts online including do not disturb and recently active within a day', () => {
    expect(statusCountsOf(people, NOW)).toEqual({
      all: 4,
      online: 1,
      away: 1,
      offline: 2,
      recent: 3,
    });
  });

  it('sorts by name, or by most recent activity for the recent view', () => {
    expect(namesOf(filterPeople(people, teams, EVERYONE, NOW))).toEqual([
      'Aditi Menon',
      'Clara Mendes',
      'Rohan Kapoor',
      'Zoya Khan',
    ]);
    expect(namesOf(filterPeople(people, teams, { ...EVERYONE, status: 'recent' }, NOW))).toEqual([
      'Zoya Khan',
      'Aditi Menon',
      'Clara Mendes',
    ]);
  });

  it('filters by team, department and text', () => {
    expect(namesOf(filterPeople(people, teams, { ...EVERYONE, teamId: NO_TEAM }, NOW))).toEqual([
      'Clara Mendes',
      'Rohan Kapoor',
    ]);
    expect(
      namesOf(filterPeople(people, teams, { ...EVERYONE, department: 'Design' }, NOW)),
    ).toEqual(['Zoya Khan']);
    expect(namesOf(filterPeople(people, teams, { ...EVERYONE, query: ' U3@ ' }, NOW))).toEqual([
      'Clara Mendes',
    ]);
    expect(departmentsOf(people)).toEqual(['Design', 'Engineering']);
  });
});
