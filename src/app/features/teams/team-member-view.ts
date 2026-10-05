import { Team, TEAM_ROLE_LABELS, TeamRole } from '../../core/models/team';
import { teamRoleOf } from '../../core/models/team-rules';
import { firstNameOf, PresenceStatus, User, userColorSeed } from '../../core/models/user';
import { presenceLabelOf } from '../../shared/pipes/presence-label';
import { formatLocalTime } from '../../shared/pipes/time-format';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { TagTone } from '../../shared/ui/tag/tag.component';

export interface TeamMemberView {
  readonly id: string;
  readonly name: string;
  readonly firstName: string;
  readonly label: string;
  readonly title: string;
  readonly role: TeamRole;
  readonly roleLabel: string;
  readonly roleTone: TagTone;
  readonly status: PresenceStatus;
  readonly presence: string;
  readonly localTime: string;
  readonly seed: number;
  readonly isMe: boolean;
}

export type TeamMemberActionKind = 'profile' | 'message' | 'role' | 'remove';

export interface TeamMemberMenuItem {
  readonly kind: TeamMemberActionKind;
  readonly label: string;
  readonly icon: IconName;
  readonly danger: boolean;
}

export const teamMemberView = (user: User, team: Team, currentUserId: string): TeamMemberView => {
  const isMe = user.id === currentUserId;
  const role = teamRoleOf(team, user.id);
  return {
    id: user.id,
    name: user.name,
    firstName: firstNameOf(user.name),
    label: isMe ? `${user.name} (you)` : user.name,
    title: user.title,
    role,
    roleLabel: TEAM_ROLE_LABELS[role],
    roleTone: role === 'member' ? 'neutral' : 'outline',
    status: user.status,
    presence: presenceLabelOf(user),
    localTime: formatLocalTime(user.timeZone),
    seed: userColorSeed(user.id),
    isMe,
  };
};

const managementItems = (role: TeamRole): readonly TeamMemberMenuItem[] => [
  {
    kind: 'role',
    label: role === 'admin' ? 'Make team member' : 'Make team admin',
    icon: 'shield-check',
    danger: false,
  },
  { kind: 'remove', label: 'Remove from team', icon: 'user-minus', danger: true },
];

export const teamMemberMenuItems = (
  member: Pick<TeamMemberView, 'isMe' | 'firstName' | 'role'>,
  canManage: boolean,
): readonly TeamMemberMenuItem[] => [
  { kind: 'profile', label: 'View profile', icon: 'user', danger: false },
  ...(member.isMe
    ? []
    : [
        {
          kind: 'message',
          label: `Message ${member.firstName}`,
          icon: 'message-square',
          danger: false,
        } satisfies TeamMemberMenuItem,
      ]),
  ...(canManage && !member.isMe && member.role !== 'owner' ? managementItems(member.role) : []),
];
