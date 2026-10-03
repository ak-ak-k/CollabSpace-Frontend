import { Team } from '../../core/models/team';
import { User, WorkspaceRole } from '../../core/models/user';
import { WorkspaceAccess } from '../../core/models/workspace';
import { formatLocalTime } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { MemberRow, memberRowOf } from './members-view';

export type MemberActionKind = 'profile' | 'edit-profile' | 'message' | 'role' | 'remove';

export interface MemberMenuItem {
  readonly kind: MemberActionKind;
  readonly label: string;
  readonly icon: IconName;
  readonly danger: boolean;
}

export interface MemberProfileView extends MemberRow {
  readonly location: string;
  readonly localTime: string;
  readonly timeZoneLabel: string;
  readonly memberSince: string;
}

export interface MemberTeamView {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly roleLabel: string;
}

const NO_VALUE = '—';

export const canChangeMember = (
  access: WorkspaceAccess,
  role: WorkspaceRole,
  removable: boolean,
): boolean => access.canManage && removable && !(role === 'owner' && !access.isOwner);

export const memberMenuItems = (
  member: Pick<MemberRow, 'isMe' | 'firstName'>,
  canChange: boolean,
): readonly MemberMenuItem[] => {
  const contact: MemberMenuItem = member.isMe
    ? { kind: 'edit-profile', label: 'Edit your profile', icon: 'pencil', danger: false }
    : {
        kind: 'message',
        label: `Message ${member.firstName}`,
        icon: 'message-square',
        danger: false,
      };
  const management: readonly MemberMenuItem[] = canChange
    ? [
        { kind: 'role', label: 'Change role…', icon: 'user-cog', danger: false },
        { kind: 'remove', label: 'Remove from workspace', icon: 'user-minus', danger: true },
      ]
    : [];
  return [
    { kind: 'profile', label: 'View profile', icon: 'user', danger: false },
    contact,
    ...management,
  ];
};

export const memberProfileOf = (
  user: User,
  viewerId: string,
  now = Date.now(),
): MemberProfileView => ({
  ...memberRowOf(user, viewerId, now),
  location: user.location,
  localTime: formatLocalTime(user.timeZone, now),
  timeZoneLabel: user.timeZoneLabel,
  memberSince: user.joinedLabel ?? NO_VALUE,
});

export const memberTeamsOf = (userId: string, teams: readonly Team[]): readonly MemberTeamView[] =>
  teams
    .filter((team) => team.memberIds.includes(userId))
    .map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code,
      roleLabel: team.leadId === userId ? 'Lead' : 'Member',
    }));
