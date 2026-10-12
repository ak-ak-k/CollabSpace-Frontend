import { ActivityEntity, ActivityEntry, ActivityPrivacy } from '../models/activity';
import { Team, TeamChanges } from '../models/team';

const NO_ROUTE = '';
const TEAM_ADMIN = 'Team admin';
const TEAM_MEMBER = 'Team member';

const teamEntity = (teamId: string): ActivityEntity => ({ type: 'team', id: teamId });

const teamRoute = (teamId: string): string => `/teams/${teamId}`;

const teamMembersRoute = (teamId: string): string => `${teamRoute(teamId)}/members`;

const teamObject = (name: string): string => `the ${name} team`;

export const privacyLabelOf = (isPrivate: boolean): ActivityPrivacy =>
  isPrivate ? 'Private' : 'Public';

const teamBase = (team: Pick<Team, 'id'>): Pick<ActivityEntry, 'teamId' | 'entity'> => ({
  teamId: team.id,
  entity: teamEntity(team.id),
});

export const teamCreatedEntry = (team: Pick<Team, 'id' | 'name' | 'isPrivate'>): ActivityEntry => ({
  kind: 'team',
  verb: 'created',
  object: teamObject(team.name),
  route: teamRoute(team.id),
  action: 'team.created',
  meta: { privacy: privacyLabelOf(team.isPrivate) },
  ...teamBase(team),
});

export const teamArchiveEntry = (team: Team, archived: boolean): ActivityEntry => ({
  kind: 'team',
  verb: archived ? 'archived' : 'restored',
  object: teamObject(team.name),
  route: archived ? NO_ROUTE : teamRoute(team.id),
  category: 'activity',
  action: archived ? 'team.archived' : 'team.unarchived',
  audit: true,
  ...teamBase(team),
});

export const teamMembershipEntry = (team: Team, joined: boolean): ActivityEntry => ({
  kind: joined ? 'join' : 'leave',
  verb: joined ? 'joined' : 'left',
  object: teamObject(team.name),
  route: teamRoute(team.id),
  action: joined ? 'team.member_joined' : 'team.member_left',
  ...teamBase(team),
});

export const teamMembersAddedEntry = (team: Team, names: readonly string[]): ActivityEntry => ({
  kind: 'join',
  verb: 'added',
  object: `${names.length === 1 ? names[0] : `${names.length} people`} to ${team.name}`,
  route: teamMembersRoute(team.id),
  action: 'team.member_added',
  meta: { count: names.length },
  ...teamBase(team),
});

export const teamMemberRemovedEntry = (team: Team, name: string): ActivityEntry => ({
  kind: 'leave',
  verb: 'removed',
  object: `${name} from ${team.name}`,
  route: teamMembersRoute(team.id),
  category: 'activity',
  action: 'team.member_removed',
  audit: true,
  ...teamBase(team),
});

export const teamRoleEntry = (
  team: Team,
  name: string,
  wasAdmin: boolean,
  isAdmin: boolean,
): ActivityEntry => ({
  kind: 'team',
  verb: isAdmin ? 'made' : 'removed',
  object: isAdmin
    ? `${name} a team admin of ${team.name}`
    : `${name} as a team admin of ${team.name}`,
  route: teamMembersRoute(team.id),
  action: 'team.role_changed',
  audit: true,
  change: {
    from: wasAdmin ? TEAM_ADMIN : TEAM_MEMBER,
    to: isAdmin ? TEAM_ADMIN : TEAM_MEMBER,
  },
  ...teamBase(team),
});

export const teamUpdateEntries = (team: Team, changes: Partial<TeamChanges>): ActivityEntry[] => {
  const name = changes.name || team.name;
  const entries: ActivityEntry[] = [];
  if (changes.name && changes.name !== team.name) {
    entries.push({
      kind: 'team',
      verb: 'renamed',
      object: `${teamObject(team.name)} to ${changes.name}`,
      route: teamRoute(team.id),
      action: 'team.renamed',
      audit: true,
      change: { from: team.name, to: changes.name },
      ...teamBase(team),
    });
  }
  if (changes.isPrivate !== undefined && changes.isPrivate !== team.isPrivate) {
    entries.push({
      kind: 'team',
      verb: 'made',
      object: `${teamObject(name)} ${changes.isPrivate ? 'private' : 'public'}`,
      route: teamRoute(team.id),
      action: 'team.privacy_changed',
      audit: true,
      change: { from: privacyLabelOf(team.isPrivate), to: privacyLabelOf(changes.isPrivate) },
      ...teamBase(team),
    });
  }
  if (changes.description !== undefined && changes.description !== team.description) {
    entries.push({
      kind: 'team',
      verb: 'updated the description of',
      object: teamObject(name),
      route: teamRoute(team.id),
      action: 'team.updated',
      ...teamBase(team),
    });
  }
  return entries;
};
