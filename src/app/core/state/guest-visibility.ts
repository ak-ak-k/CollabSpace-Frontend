import { Team } from '../models/team';
import { User, WorkspaceRole } from '../models/user';

export interface Viewer {
  readonly userId: string;
  readonly role: WorkspaceRole;
}

type TeamRoster = Pick<Team, 'memberIds'>;

type TeamPrivacy = Pick<Team, 'id' | 'memberIds' | 'isPrivate'>;

export const isGuestViewer = (viewer: Viewer): boolean => viewer.role === 'guest';

export const canSeeTeam = (team: TeamRoster, viewer: Viewer): boolean =>
  !isGuestViewer(viewer) || team.memberIds.includes(viewer.userId);

export const readableTeamIdsOf = (
  teams: readonly TeamPrivacy[],
  userId: string,
): ReadonlySet<string> =>
  new Set(
    teams
      .filter((team) => !team.isPrivate || team.memberIds.includes(userId))
      .map((team) => team.id),
  );

export const teammatesOf = (teams: readonly TeamRoster[], userId: string): ReadonlySet<string> =>
  new Set(
    teams.filter((team) => team.memberIds.includes(userId)).flatMap((team) => team.memberIds),
  );

export const visibleMembersFor = <Member extends Pick<User, 'id'>>(
  members: readonly Member[],
  teams: readonly TeamRoster[],
  viewer: Viewer,
): readonly Member[] => {
  if (!isGuestViewer(viewer)) {
    return members;
  }
  const teammates = teammatesOf(teams, viewer.userId);
  return members.filter((member) => member.id === viewer.userId || teammates.has(member.id));
};
