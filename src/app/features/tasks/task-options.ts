import { Team } from '../../core/models/team';
import { User } from '../../core/models/user';
import { SelectOption } from '../../shared/ui/select/select.component';

export const UNASSIGNED_OPTION: SelectOption = { value: '', label: 'Unassigned' };
export const NO_TEAM_OPTION: SelectOption = { value: '', label: 'No team' };

const SEPARATOR = ' · ';

const nameOf = (user: User, currentUserId: string | undefined): string =>
  user.id === currentUserId ? `${user.name} (you)` : user.name;

export const memberOptionsOf = (
  members: readonly User[],
  currentUserId: string | undefined,
): SelectOption[] =>
  members.map((user) => ({ value: user.id, label: nameOf(user, currentUserId) }));

export const assigneeOptionsFor = (
  members: readonly User[],
  team: Team | null,
  currentUserId: string | undefined,
): SelectOption[] => {
  const inTeam = (user: User): boolean => !!team && team.memberIds.includes(user.id);
  const ordered = [...members].sort(
    (first, second) =>
      Number(inTeam(second)) - Number(inTeam(first)) || first.name.localeCompare(second.name),
  );
  return [
    UNASSIGNED_OPTION,
    ...ordered.map((user) => ({
      value: user.id,
      label: `${nameOf(user, currentUserId)}${team && inTeam(user) ? SEPARATOR + team.name : ''}`,
    })),
  ];
};

export const teamOptionsOf = (teams: readonly Team[]): SelectOption[] => [
  NO_TEAM_OPTION,
  ...teams.map((team) => ({ value: team.id, label: team.name })),
];
