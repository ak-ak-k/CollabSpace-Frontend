import { Team } from '../../../core/models/team';
import { firstNameOf, PresenceStatus, User, userColorSeed } from '../../../core/models/user';
import { WORKSPACE_ROLE_LABELS } from '../../../core/models/workspace-role';
import { teamsOfPerson } from '../../../core/state/people-view';
import { statusLineOf } from '../../../core/state/person-status';
import { formatLocalTime } from '../../pipes/time-format';
import { profileRouteOf } from './person-actions.service';

export interface PersonView {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly firstName: string;
  readonly title: string;
  readonly department: string;
  readonly email: string;
  readonly seed: number;
  readonly status: PresenceStatus;
  readonly statusLine: string;
  readonly roleLabel: string;
  readonly showRole: boolean;
  readonly bio: string;
  readonly localTime: string;
  readonly timeZoneLabel: string;
  readonly location: string;
  readonly memberSince: string;
  readonly profileRoute: string;
  readonly isMe: boolean;
}

export interface PersonTeamView {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly roleLabel: string;
  readonly memberCount: number;
}

const NO_VALUE = '—';

export const personViewOf = (user: User, viewerId: string, now = Date.now()): PersonView => {
  const isMe = user.id === viewerId;
  return {
    id: user.id,
    name: user.name,
    label: isMe ? `${user.name} (you)` : user.name,
    firstName: firstNameOf(user.name),
    title: user.title,
    department: user.department,
    email: user.email,
    seed: userColorSeed(user.id),
    status: user.status,
    statusLine: statusLineOf(user, now),
    roleLabel: WORKSPACE_ROLE_LABELS[user.role],
    showRole: user.role !== 'member',
    bio: user.bio ?? '',
    localTime: formatLocalTime(user.timeZone, now),
    timeZoneLabel: user.timeZoneLabel,
    location: user.location,
    memberSince: user.joinedLabel ?? NO_VALUE,
    profileRoute: profileRouteOf(user.id, isMe),
    isMe,
  };
};

export const personTeamsOf = (userId: string, teams: readonly Team[]): readonly PersonTeamView[] =>
  teamsOfPerson(userId, teams).map((team) => ({
    id: team.id,
    name: team.name,
    code: team.code,
    roleLabel: team.leadId === userId ? 'Lead' : 'Member',
    memberCount: team.memberIds.length,
  }));
