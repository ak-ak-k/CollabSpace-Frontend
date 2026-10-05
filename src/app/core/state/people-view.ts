import { Team } from '../models/team';
import { User } from '../models/user';
import { lastActiveAtOf, wasActiveWithinDay } from './person-status';

export type PeopleStatusFilter = 'all' | 'online' | 'away' | 'offline' | 'recent';

export interface PeopleQuery {
  readonly query: string;
  readonly status: PeopleStatusFilter;
  readonly teamId: string;
  readonly department: string;
}

export const ALL_TEAMS = 'all';
export const NO_TEAM = 'none';
export const ALL_DEPARTMENTS = 'all';

export const PEOPLE_STATUS_FILTERS: readonly PeopleStatusFilter[] = [
  'all',
  'online',
  'away',
  'offline',
  'recent',
];

export const EVERYONE: PeopleQuery = {
  query: '',
  status: 'all',
  teamId: ALL_TEAMS,
  department: ALL_DEPARTMENTS,
};

export const peopleStatusFilterOf = (value: string | undefined): PeopleStatusFilter =>
  PEOPLE_STATUS_FILTERS.find((filter) => filter === value) ?? 'all';

export const teamsOfPerson = (userId: string, teams: readonly Team[]): readonly Team[] =>
  teams.filter((team) => team.memberIds.includes(userId));

export const matchesStatus = (
  user: User,
  status: PeopleStatusFilter,
  now = Date.now(),
): boolean => {
  switch (status) {
    case 'online':
      return user.status === 'online' || user.status === 'dnd';
    case 'away':
    case 'offline':
      return user.status === status;
    case 'recent':
      return wasActiveWithinDay(user, now);
    default:
      return true;
  }
};

const matchesTeam = (user: User, teamId: string, teams: readonly Team[]): boolean => {
  if (teamId === ALL_TEAMS) {
    return true;
  }
  const memberships = teamsOfPerson(user.id, teams);
  return teamId === NO_TEAM
    ? memberships.length === 0
    : memberships.some((team) => team.id === teamId);
};

const matchesText = (user: User, query: string): boolean =>
  !query ||
  [user.name, user.email, user.title, user.department].some((field) =>
    field.toLowerCase().includes(query),
  );

const byName = (first: User, second: User): number => first.name.localeCompare(second.name);

export const filterPeople = (
  people: readonly User[],
  teams: readonly Team[],
  filters: PeopleQuery,
  now = Date.now(),
): readonly User[] => {
  const query = filters.query.trim().toLowerCase();
  const department = filters.department;
  const matches = people.filter(
    (user) =>
      matchesStatus(user, filters.status, now) &&
      matchesTeam(user, filters.teamId, teams) &&
      (department === ALL_DEPARTMENTS || user.department === department) &&
      matchesText(user, query),
  );
  if (filters.status !== 'recent') {
    return [...matches].sort(byName);
  }
  return [...matches].sort(
    (first, second) =>
      lastActiveAtOf(second, now) - lastActiveAtOf(first, now) || byName(first, second),
  );
};

export const departmentsOf = (people: readonly User[]): readonly string[] =>
  [...new Set(people.map((user) => user.department).filter(Boolean))].sort((first, second) =>
    first.localeCompare(second),
  );

export const statusCountsOf = (
  people: readonly User[],
  now = Date.now(),
): Record<PeopleStatusFilter, number> => {
  const countOf = (status: PeopleStatusFilter) =>
    people.filter((user) => matchesStatus(user, status, now)).length;
  return {
    all: people.length,
    online: countOf('online'),
    away: countOf('away'),
    offline: countOf('offline'),
    recent: countOf('recent'),
  };
};
