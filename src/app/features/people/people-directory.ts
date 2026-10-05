import { computed, Signal } from '@angular/core';
import { User } from '../../core/models/user';
import {
  ALL_DEPARTMENTS,
  ALL_TEAMS,
  departmentsOf,
  filterPeople,
  NO_TEAM,
  PeopleStatusFilter,
  statusCountsOf,
} from '../../core/state/people-view';
import { WorkspaceState } from '../../core/state/workspace.state';
import {
  activeFiltersOf,
  departmentOptionsOf,
  noPeopleView,
  personRowOf,
  statusChipsOf,
  teamOptionsOf,
} from './people-page-view';

export interface PeopleDirectorySources {
  readonly workspace: WorkspaceState;
  readonly query: Signal<string>;
  readonly status: Signal<PeopleStatusFilter>;
  readonly teamId: Signal<string>;
  readonly department: Signal<string>;
}

const everyoneIn = (workspace: WorkspaceState): Signal<readonly User[]> =>
  computed(() => {
    const me = workspace.currentUser();
    if (workspace.loadStatus() === 'empty') {
      return me ? [me] : [];
    }
    return workspace.members();
  });

const knownTeam = (workspace: WorkspaceState, teamId: Signal<string>): Signal<string> =>
  computed(() => {
    const selected = teamId();
    const known = selected === NO_TEAM || workspace.teams().some((team) => team.id === selected);
    return known ? selected : ALL_TEAMS;
  });

const knownDepartment = (
  everyone: Signal<readonly User[]>,
  department: Signal<string>,
): Signal<string> =>
  computed(() =>
    departmentsOf(everyone()).includes(department()) ? department() : ALL_DEPARTMENTS,
  );

export const createPeopleDirectory = (sources: PeopleDirectorySources) => {
  const { workspace, query, status } = sources;
  const workspaceName = computed(() => workspace.currentWorkspace()?.name ?? 'this workspace');
  const everyone = everyoneIn(workspace);
  const teamId = knownTeam(workspace, sources.teamId);
  const department = knownDepartment(everyone, sources.department);
  const teamOptions = computed(() => teamOptionsOf(workspace.teams()));
  const departmentOptions = computed(() => departmentOptionsOf(departmentsOf(everyone())));

  const rows = computed(() => {
    const now = Date.now();
    const teams = workspace.teams();
    const viewerId = workspace.currentUser()?.id ?? '';
    const filters = {
      query: query(),
      status: status(),
      teamId: teamId(),
      department: department(),
    };
    const matches =
      workspace.loadStatus() === 'empty'
        ? everyone()
        : filterPeople(everyone(), teams, filters, now);
    return matches.map((user) => personRowOf(user, teams, viewerId, now));
  });

  const activeFilters = computed(() => {
    const selected = teamId();
    const team = teamOptions().find((option) => option.value === selected);
    return activeFiltersOf(selected === ALL_TEAMS ? null : (team?.label ?? null), department());
  });

  return {
    workspaceName,
    everyone,
    teamOptions,
    departmentOptions,
    rows,
    activeFilters,
    chips: computed(() => statusChipsOf(statusCountsOf(everyone()))),
    empty: computed(() => noPeopleView(query(), activeFilters().length, status(), workspaceName())),
  };
};

export type PeopleDirectory = ReturnType<typeof createPeopleDirectory>;
