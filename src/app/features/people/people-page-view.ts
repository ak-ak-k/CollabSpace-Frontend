import { Team } from '../../core/models/team';
import { PresenceStatus, User } from '../../core/models/user';
import {
  ALL_DEPARTMENTS,
  ALL_TEAMS,
  NO_TEAM,
  PEOPLE_STATUS_FILTERS,
  PeopleStatusFilter,
  teamsOfPerson,
} from '../../core/state/people-view';
import { PersonView, personViewOf } from '../../shared/components/person-panel/person-panel-view';
import { formatCount } from '../../shared/pipes/count.pipe';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { SelectOption } from '../../shared/ui/select/select.component';

export type PeopleLayout = 'grid' | 'list';
export type EmptyAction = 'clear-search' | 'clear-filters' | null;
export type ActiveFilterKind = 'team' | 'department';

export interface PersonRow extends PersonView {
  readonly organisation: string;
  readonly teams: readonly Pick<Team, 'id' | 'name'>[];
}

export interface StatusChip {
  readonly filter: PeopleStatusFilter;
  readonly label: string;
  readonly link: string;
  readonly count: number;
  readonly dot: PresenceStatus | null;
}

export interface ActiveFilter {
  readonly kind: ActiveFilterKind;
  readonly label: string;
  readonly removeLabel: string;
}

export interface PeopleEmptyView {
  readonly icon: IconName;
  readonly heading: string;
  readonly message: string;
  readonly actionLabel: string;
  readonly action: EmptyAction;
}

export const PEOPLE_ROUTE = '/people';

const CHIP_LABELS: Record<PeopleStatusFilter, string> = {
  all: 'All',
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  recent: 'Recently active',
};

const CHIP_DOTS: Record<PeopleStatusFilter, PresenceStatus | null> = {
  all: null,
  online: 'online',
  away: 'away',
  offline: 'offline',
  recent: null,
};

export const peopleCount = (count: number): string => formatCount(count, 'person', 'people');

export const statusChipsOf = (counts: Record<PeopleStatusFilter, number>): StatusChip[] =>
  PEOPLE_STATUS_FILTERS.map((filter) => ({
    filter,
    label: CHIP_LABELS[filter],
    link: filter === 'all' ? PEOPLE_ROUTE : `${PEOPLE_ROUTE}/${filter}`,
    count: counts[filter],
    dot: CHIP_DOTS[filter],
  }));

const organisationOf = (user: User, teams: readonly Team[]): string => {
  const [first, ...others] = teams;
  const teamText = first ? `${first.name}${others.length ? ` +${others.length}` : ''}` : 'No team';
  return `${user.department} · ${teamText}`;
};

export const personRowOf = (
  user: User,
  allTeams: readonly Team[],
  viewerId: string,
  now = Date.now(),
): PersonRow => {
  const teams = teamsOfPerson(user.id, allTeams);
  return {
    ...personViewOf(user, viewerId, now),
    organisation: organisationOf(user, teams),
    teams: teams.map(({ id, name }) => ({ id, name })),
  };
};

export const teamOptionsOf = (teams: readonly Team[]): SelectOption[] => [
  { value: ALL_TEAMS, label: 'All teams' },
  ...teams.map((team) => ({ value: team.id, label: team.name })),
  { value: NO_TEAM, label: 'No team' },
];

export const departmentOptionsOf = (departments: readonly string[]): SelectOption[] => [
  { value: ALL_DEPARTMENTS, label: 'All departments' },
  ...departments.map((department) => ({ value: department, label: department })),
];

export const activeFiltersOf = (teamName: string | null, department: string): ActiveFilter[] => {
  const filters: ActiveFilter[] = [];
  if (teamName) {
    filters.push({
      kind: 'team',
      label: `Team: ${teamName}`,
      removeLabel: `Remove team filter ${teamName}`,
    });
  }
  if (department !== ALL_DEPARTMENTS) {
    filters.push({
      kind: 'department',
      label: `Department: ${department}`,
      removeLabel: `Remove department filter ${department}`,
    });
  }
  return filters;
};

const statusEmptyView = (
  status: PeopleStatusFilter,
  workspaceName: string,
): Omit<PeopleEmptyView, 'actionLabel' | 'action'> => {
  switch (status) {
    case 'online':
      return {
        icon: 'contact',
        heading: 'No one else is online',
        message: 'Message someone anyway — they’ll see it when they’re back.',
      };
    case 'away':
      return {
        icon: 'contact',
        heading: 'No one is away right now',
        message: 'Everyone is either online or signed out.',
      };
    case 'offline':
      return {
        icon: 'contact',
        heading: 'Everyone is signed in',
        message: `Nobody in ${workspaceName} is offline right now.`,
      };
    default:
      return {
        icon: 'history',
        heading: 'No one active in the last day',
        message: 'People who were online in the last 24 hours show up here.',
      };
  }
};

export const noPeopleView = (
  query: string,
  activeFilterCount: number,
  status: PeopleStatusFilter,
  workspaceName: string,
): PeopleEmptyView => {
  const trimmed = query.trim();
  if (trimmed) {
    return {
      icon: 'search',
      heading: `No one matches “${trimmed}”`,
      message: 'Try a different name, email, job title or department.',
      actionLabel: 'Clear search',
      action: 'clear-search',
    };
  }
  if (activeFilterCount > 0) {
    return {
      icon: 'sliders-horizontal',
      heading: 'No one fits these filters',
      message: 'Try another team or department, or clear the filters.',
      actionLabel: 'Clear filters',
      action: 'clear-filters',
    };
  }
  return { ...statusEmptyView(status, workspaceName), actionLabel: '', action: null };
};
